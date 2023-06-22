import { ESLintUtils } from "@typescript-eslint/experimental-utils";
import { createEslintRule } from "../utils/create-eslint-rule";
import { DiagnosticCategory } from "typescript";
import { posToLoc } from "../utils/pos-to-loc";

export const RULE_NAME = "all";
export type MessageIds = "typescriptError";
export type Options = [];

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "problem",
    docs: {
      description: "Enforce strict null checks",
      recommended: "warn",
    },
    schema: [],
    messages: {
      typescriptError: "{{ errorMessage }}",
    },
  },
  defaultOptions: [],
  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);

    return {
      Program(astNode) {
        const semErrors = parserServices.program.getSemanticDiagnostics();
        const code = parserServices.esTreeNodeToTSNodeMap.get(astNode).text;

        semErrors.forEach((error) => {
          if (error.reportsUnnecessary) return;
          if (error.category !== DiagnosticCategory.Error) return;

          context.report({
            messageId: "typescriptError",
            data: { errorMessage: error.messageText },
            loc: posToLoc(code, error.start!, error.start! + error.length!),
          });
        });
      },
    };
  },
});
