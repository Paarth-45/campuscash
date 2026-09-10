package com.campuscash.service;

import com.campuscash.dto.AiDtos;
import com.campuscash.dto.DashboardResponse;
import com.campuscash.model.Category;
import com.campuscash.model.PaymentMethod;
import com.campuscash.model.TransactionType;
import com.campuscash.repository.CategoryRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    private final CategoryRepository categoryRepository;
    private final DashboardService dashboardService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @Value("${app.ai.gemini-api-key:}")
    private String geminiApiKey;

    @Value("${app.ai.openai-api-key:}")
    private String openaiApiKey;

    @Value("${app.ai.provider:GEMINI}")
    private String aiProvider;

    /**
     * Natural Language Expense Parser
     * Supports Google Gemini / OpenAI when API keys are supplied, with seamless offline heuristic fallback.
     */
    public AiDtos.AiParseResponse parseExpenseText(Long userId, String text) {
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Input text cannot be empty.");
        }

        // Try Cloud AI if API key is present
        if (hasCloudAiConfigured()) {
            try {
                AiDtos.AiParseResponse cloudResult = parseWithCloudAi(userId, text);
                if (cloudResult != null) {
                    return cloudResult;
                }
            } catch (Exception e) {
                log.warn("Cloud AI parsing failed, falling back to local heuristic engine: {}", e.getMessage());
            }
        }

        // Local Heuristic Fallback Engine
        return parseWithHeuristic(userId, text);
    }

    /**
     * Grounded AI Financial Assistant
     * Combines user real data with LLM generation or offline contextual financial rules.
     */
    public AiDtos.AiChatResponse chatAssistant(Long userId, String message) {
        DashboardResponse dash = dashboardService.getDashboardData(userId);

        if (hasCloudAiConfigured()) {
            try {
                AiDtos.AiChatResponse cloudReply = chatWithCloudAi(dash, message);
                if (cloudReply != null) {
                    return cloudReply;
                }
            } catch (Exception e) {
                log.warn("Cloud AI chat failed, falling back to local grounded coach: {}", e.getMessage());
            }
        }

        return chatWithLocalGroundedCoach(dash, message);
    }

    private boolean hasCloudAiConfigured() {
        return (geminiApiKey != null && !geminiApiKey.isBlank()) ||
               (openaiApiKey != null && !openaiApiKey.isBlank());
    }

    private AiDtos.AiParseResponse parseWithCloudAi(Long userId, String text) throws Exception {
        List<Category> categories = categoryRepository.findAllAvailableForUser(userId);
        String categoryNames = categories.stream().map(Category::getName).reduce((a, b) -> a + ", " + b).orElse("Food, Books, Rent");

        String prompt = String.format(
                "You are a financial parser for college students. Extract JSON with keys: 'amount' (number), 'type' (INCOME or EXPENSE), 'category' (best match from: [%s]), 'merchant' (string or place), 'description' (string), 'paymentMethod' (UPI, CASH, CARD, or NET_BANKING). User says: \"%s\". Return ONLY raw JSON without markdown or code fences.",
                categoryNames, text.replace("\"", "'")
        );

        String jsonResponse = null;
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            jsonResponse = callGeminiApi(prompt);
        } else if (openaiApiKey != null && !openaiApiKey.isBlank()) {
            jsonResponse = callOpenAiApi(prompt);
        }

        if (jsonResponse != null) {
            JsonNode node = objectMapper.readTree(cleanJsonString(jsonResponse));
            BigDecimal amount = BigDecimal.valueOf(node.path("amount").asDouble(150.0));
            TransactionType type = "INCOME".equalsIgnoreCase(node.path("type").asText()) ? TransactionType.INCOME : TransactionType.EXPENSE;
            String catName = node.path("category").asText("Food & Canteen");
            String merchant = node.path("merchant").asText("Campus Store");
            String desc = node.path("description").asText(text);
            PaymentMethod pm = PaymentMethod.UPI;
            try {
                pm = PaymentMethod.valueOf(node.path("paymentMethod").asText("UPI").toUpperCase());
            } catch (Exception ignored) {}

            Category matched = findCategoryByName(categories, catName);

            return AiDtos.AiParseResponse.builder()
                    .amount(amount)
                    .type(type)
                    .category(matched != null ? matched.getName() : catName)
                    .categoryId(matched != null ? matched.getId() : null)
                    .merchant(merchant)
                    .description(desc)
                    .paymentMethod(pm)
                    .date(LocalDate.now())
                    .confidence(0.98)
                    .explanation("Extracted via Cloud LLM Model. Verify details before saving.")
                    .build();
        }
        return null;
    }

    private AiDtos.AiChatResponse chatWithCloudAi(DashboardResponse dash, String userMessage) throws Exception {
        String context = String.format(
                "Student: %s. Currency: ₹. Current Balance: ₹%s. Daily Safe-to-Spend: ₹%s/day for %d remaining days. Committed bills: ₹%s. Savings goals target: ₹%s. Month spending so far: ₹%s across %d active budgets.",
                dash.getUserName(), dash.getCurrentBalance(), dash.getSafeToSpend().getDailySafeToSpend(),
                dash.getSafeToSpend().getRemainingDaysInMonth(), dash.getSafeToSpend().getUpcomingCommittedExpenses(),
                dash.getMonthSavings(), dash.getMonthExpenses(), dash.getBudgetUtilization().size()
        );

        String systemPrompt = "You are CampusCash AI, an encouraging financial assistant for college students. Answer clearly in 2-3 sentences based strictly on the student's real financial context. Suggest one practical action.";
        String fullPrompt = systemPrompt + "\nContext: " + context + "\nStudent asked: " + userMessage;

        String replyText = null;
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            replyText = callGeminiApi(fullPrompt);
        } else if (openaiApiKey != null && !openaiApiKey.isBlank()) {
            replyText = callOpenAiApi(fullPrompt);
        }

        if (replyText != null && !replyText.isBlank()) {
            return AiDtos.AiChatResponse.builder()
                    .reply(replyText.trim())
                    .actionableTip("Check your daily Safe-to-Spend before making discretionary purchases.")
                    .categoryFocus("Financial Overview")
                    .build();
        }
        return null;
    }

    private String callGeminiApi(String prompt) throws Exception {
        String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

        Map<String, Object> payload = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt))
                ))
        );

        String requestBody = objectMapper.writeValueAsString(payload);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(6))
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(response.body());
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        }
        return null;
    }

    private String callOpenAiApi(String prompt) throws Exception {
        String endpoint = "https://api.openai.com/v1/chat/completions";

        Map<String, Object> payload = Map.of(
                "model", "gpt-4o-mini",
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "temperature", 0.3
        );

        String requestBody = objectMapper.writeValueAsString(payload);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + openaiApiKey)
                .timeout(Duration.ofSeconds(6))
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(response.body());
            return root.path("choices").get(0).path("message").path("content").asText();
        }
        return null;
    }

    private String cleanJsonString(String raw) {
        String clean = raw.trim();
        if (clean.startsWith("```json")) clean = clean.substring(7);
        if (clean.startsWith("```")) clean = clean.substring(3);
        if (clean.endsWith("```")) clean = clean.substring(0, clean.length() - 3);
        return clean.trim();
    }

    // Heuristic Engine
    private AiDtos.AiParseResponse parseWithHeuristic(Long userId, String text) {
        String lower = text.toLowerCase();
        BigDecimal amount = extractAmount(lower);
        TransactionType type = lower.contains("got") || lower.contains("received") || lower.contains("earned") || lower.contains("allowance") || lower.contains("salary")
                ? TransactionType.INCOME : TransactionType.EXPENSE;

        PaymentMethod paymentMethod = PaymentMethod.UPI;
        if (lower.contains("cash")) paymentMethod = PaymentMethod.CASH;
        else if (lower.contains("card")) paymentMethod = PaymentMethod.CARD;
        else if (lower.contains("net banking") || lower.contains("transfer")) paymentMethod = PaymentMethod.NET_BANKING;

        List<Category> categories = categoryRepository.findAllAvailableForUser(userId);
        Category matchedCategory = null;

        if (lower.contains("food") || lower.contains("canteen") || lower.contains("mess") || lower.contains("biryani") || lower.contains("chai") || lower.contains("coffee") || lower.contains("lunch") || lower.contains("dinner") || lower.contains("snack")) {
            matchedCategory = findCategoryByName(categories, "Food & Canteen");
        } else if (lower.contains("book") || lower.contains("stationery") || lower.contains("print") || lower.contains("photocopy") || lower.contains("exam") || lower.contains("course")) {
            matchedCategory = findCategoryByName(categories, "Academics & Books");
        } else if (lower.contains("rent") || lower.contains("hostel") || lower.contains("room") || lower.contains("electricity")) {
            matchedCategory = findCategoryByName(categories, "Hostel & Rent");
        } else if (lower.contains("metro") || lower.contains("auto") || lower.contains("bus") || lower.contains("cab") || lower.contains("uber") || lower.contains("ola") || lower.contains("petrol")) {
            matchedCategory = findCategoryByName(categories, "Commute & Transit");
        } else if (lower.contains("movie") || lower.contains("game") || lower.contains("outing") || lower.contains("party") || lower.contains("hangout")) {
            matchedCategory = findCategoryByName(categories, "Hangouts & Fun");
        } else if (lower.contains("spotify") || lower.contains("netflix") || lower.contains("prime") || lower.contains("recharge") || lower.contains("wifi")) {
            matchedCategory = findCategoryByName(categories, "Subscriptions & Bills");
        }

        if (matchedCategory == null && !categories.isEmpty()) {
            matchedCategory = categories.get(0);
        }

        String merchant = extractMerchant(text);
        String description = cleanDescription(text, amount);

        return AiDtos.AiParseResponse.builder()
                .amount(amount != null ? amount : BigDecimal.ZERO)
                .type(type)
                .category(matchedCategory != null ? matchedCategory.getName() : "General")
                .categoryId(matchedCategory != null ? matchedCategory.getId() : null)
                .merchant(merchant)
                .description(description)
                .paymentMethod(paymentMethod)
                .date(LocalDate.now())
                .confidence(0.95)
                .explanation("Extracted using CampusCash NLP Engine. Confirm details below before saving.")
                .build();
    }

    private AiDtos.AiChatResponse chatWithLocalGroundedCoach(DashboardResponse dash, String message) {
        String lower = message.toLowerCase();
        String reply;
        String tip;
        String focus = "General";

        if (lower.contains("safe to spend") || lower.contains("how much can i spend")) {
            reply = String.format("Your current Safe-to-Spend is **₹%s per day** for the remaining %d days of this month. This already reserves money for upcoming committed bills (₹%s) and savings targets (₹%s).",
                    dash.getSafeToSpend().getDailySafeToSpend().setScale(0, BigDecimal.ROUND_HALF_UP),
                    dash.getSafeToSpend().getRemainingDaysInMonth(),
                    dash.getSafeToSpend().getUpcomingCommittedExpenses().setScale(0, BigDecimal.ROUND_HALF_UP),
                    dash.getSafeToSpend().getRemainingSavingsTarget().setScale(0, BigDecimal.ROUND_HALF_UP)
            );
            tip = "Check the Safe-to-Spend widget every morning before making non-essential purchases!";
            focus = "Safe-to-Spend";
        } else if (lower.contains("save") || lower.contains("saving") || lower.contains("goal")) {
            reply = String.format("You currently have ₹%s saved toward your goals. Your monthly income/pocket money is ₹%s. Setting aside 10-15%% (around ₹%s) right when your allowance arrives will ensure you hit your targets effortlessly without feeling pinched later.",
                    dash.getMonthSavings().setScale(0, BigDecimal.ROUND_HALF_UP),
                    dash.getMonthlyIncome().setScale(0, BigDecimal.ROUND_HALF_UP),
                    dash.getMonthlyIncome().multiply(BigDecimal.valueOf(0.15)).setScale(0, BigDecimal.ROUND_HALF_UP)
            );
            tip = "Use the 'Can I Afford It?' simulator before impulsive gadget or clothing purchases.";
            focus = "Savings";
        } else if (lower.contains("budget") || lower.contains("canteen") || lower.contains("food")) {
            reply = String.format("You have %d active category budgets this month. Your total spending so far is ₹%s. Campus canteen and food delivery are typically the biggest leakage areas for students.",
                    dash.getBudgetUtilization().size(),
                    dash.getMonthExpenses().setScale(0, BigDecimal.ROUND_HALF_UP)
            );
            tip = "Try setting a weekly food limit to prevent mid-month budget depletion.";
            focus = "Budgets";
        } else {
            reply = String.format("Hello %s! Based on your current balance of ₹%s and daily Safe-to-Spend of ₹%s/day, your finances are well under control. You can ask me about affordability, savings goals, or type any expense in natural language to record it quickly.",
                    dash.getUserName(),
                    dash.getCurrentBalance().setScale(0, BigDecimal.ROUND_HALF_UP),
                    dash.getSafeToSpend().getDailySafeToSpend().setScale(0, BigDecimal.ROUND_HALF_UP)
            );
            tip = "Try asking: 'Can I afford a ₹1,200 dinner this weekend?' or 'How is my budget pacing?'";
            focus = "Financial Health";
        }

        return AiDtos.AiChatResponse.builder()
                .reply(reply)
                .actionableTip(tip)
                .categoryFocus(focus)
                .build();
    }

    private BigDecimal extractAmount(String text) {
        Pattern p = Pattern.compile("(?:₹|rs\\.?|inr)?\\s*(\\d+(?:\\.\\d{1,2})?)\\s*(?:rs|rupees)?");
        Matcher m = p.matcher(text);
        if (m.find()) {
            try {
                return new BigDecimal(m.group(1));
            } catch (Exception ignored) {}
        }
        return BigDecimal.valueOf(100);
    }

    private String extractMerchant(String text) {
        Pattern p = Pattern.compile("(?:at|from)\\s+([A-Za-z0-9\\s&]+?)(?:\\s+(?:via|with|for|on|using)|$)", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(text);
        if (m.find()) {
            return m.group(1).trim();
        }
        return "Campus Store";
    }

    private String cleanDescription(String text, BigDecimal amount) {
        String clean = text;
        if (amount != null) {
            clean = clean.replaceAll("(?i)(?:₹|rs\\.?|inr)?\\s*" + amount.intValue() + "\\s*(?:rs|rupees)?", "");
        }
        clean = clean.replaceAll("(?i)\\b(spent|paid|for|on|via|upi|cash|card|with|at)\\b", "").trim();
        if (clean.isBlank()) return text;
        return Character.toUpperCase(clean.charAt(0)) + clean.substring(1);
    }

    private Category findCategoryByName(List<Category> categories, String name) {
        for (Category c : categories) {
            if (c.getName().equalsIgnoreCase(name)) return c;
        }
        return null;
    }
}
