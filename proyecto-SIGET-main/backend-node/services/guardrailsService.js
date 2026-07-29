/**
 * Guardrails Service for input validation and security checks.
 * Prevents prompt injection and jailbreak attempts before they reach the local LLM.
 */

const INJECTION_PATTERNS = [
  /ignora\s+.*instrucciones/i,
  /ignora\s+.*lo\s+anterior/i,
  /revel(a|e|ar)\s+.*system\s*prompt/i,
  /revel(a|e|ar)\s+.*prompt\s+de\s+sistema/i,
  /system\s*prompt/i,
  /prompt\s+de\s+sistema/i,
  /instrucciones\s+de\s+sistema/i,
  /ignore\s+.*instructions/i,
  /reveal\s+.*system\s*prompt/i,
  /bypass\s+.*safety/i,
  /perito\s+corrupto/i,
  /reset\s+instructions/i,
  /nueva\s+instrucción\s+de\s+sistema/i
];

/**
 * Checks if a user prompt contains patterns matching prompt injection.
 * @param {string} text The user-submitted text query.
 * @returns {boolean} True if prompt injection is suspected, false otherwise.
 */
function checkPromptInjection(text) {
  if (!text || typeof text !== 'string') return false;
  
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return true;
    }
  }
  return false;
}

module.exports = {
  checkPromptInjection
};
