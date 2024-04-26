package io.openbas.rest.stream.ai;

public class AiPrompt {

    private static String promptEmail(String question) {
        return question;
    }

    public static String promptGeneration(String type, String question, AiConfig aiConfig) {
        String prompt;
        String promptType = type != null ? type : "EMAIL";
        prompt = switch (promptType) {
            case "EMAIL" -> promptEmail(question);
            default -> question;
        };
        return "{\n" +
                "    \"model\": \""+ aiConfig.getModel() + "\",\n" +
                "    \"stream\": true,\n" +
                "    \"messages\": [\n" +
                "        {\n" +
                "            \"role\": \"user\",\n" +
                "            \"content\": \" " + prompt + "\"\n" +
                "        }\n" +
                "    ]\n" +
                "}";
    }
}
