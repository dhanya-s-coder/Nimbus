/*
 Source: Toast-js by Breno Roosevelt
 Repository: https://github.com/brenoroosevelt/toast-js
 License: MIT
 This file exports the official @brenoroosevelt/toast library.
 Importing directly from toast.js to avoid broken internal imports in index.js.
 */

import { create,info,warning,success,error,system,ToastTypes as types} from '@brenoroosevelt/toast/lib/esm/toast.js';

const toast = {
  create,
  info,
  warning,
  success,
  error,
  system,
  types
};

export {
  toast,
  create,
  info,
  warning,
  success,
  error,
  system,
  types
};

export default toast;
