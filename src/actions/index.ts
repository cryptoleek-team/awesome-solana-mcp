import getValidatorInfoAction from "./validator/getValidatorInfo.js";
import getPriorityFeeEstimateAction from "./priorityFee/getPriorityFeeEstimate.js";
import getTransactionHistoryAction from "./transaction/getTransactionHistory.js";
import getSecurityTxtAction from "./security/getSecurityTxt.js";

// Export all actions
export const ACTIONS = {
  GET_VALIDATOR_INFO_ACTION: getValidatorInfoAction,
  GET_PRIORITY_FEE_ESTIMATE_ACTION: getPriorityFeeEstimateAction,
  GET_TRANSACTION_HISTORY_ACTION: getTransactionHistoryAction,
  GET_SECURITY_TXT_ACTION: getSecurityTxtAction,
};

// Export individual actions for direct imports
export { default as GET_VALIDATOR_INFO_ACTION } from "./validator/getValidatorInfo.js";
export { default as GET_PRIORITY_FEE_ESTIMATE_ACTION } from "./priorityFee/getPriorityFeeEstimate.js";
export { default as GET_TRANSACTION_HISTORY_ACTION } from "./transaction/getTransactionHistory.js";
export { default as GET_SECURITY_TXT_ACTION } from "./security/getSecurityTxt.js";
