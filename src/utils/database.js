/**
 * Funções úteis para trabalhar
 * com dados.
 *
 * @author Dev Gui
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PREFIX, SPIDER_API_TOKEN } from "../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databasePath = path.resolve(__dirname, "..", "..", "database");

const ANTI_LINK_GROUPS_FILE = "anti-link-groups";
const AUTO_RESPONDER_FILE = "auto-responder";
const AUTO_RESPONDER_GROUPS_FILE = "auto-responder-groups";
const AUTO_STICKER_GROUPS_FILE = "auto-sticker-groups";
const CONFIG_FILE = "config";
const EXIT_GROUPS_FILE = "exit-groups";
const GROUP_RESTRICTIONS_FILE = "group-restrictions";
const INACTIVE_GROUPS_FILE = "inactive-groups";
const MUTE_FILE = "muted";
const ONLY_ADMINS_FILE = "only-admins";
const PREFIX_GROUPS_FILE = "prefix-groups";
const RESTRICTED_MESSAGES_FILE = "restricted-messages";
const WELCOME_GROUPS_FILE = "welcome-groups";

function createIfNotExists(fullPath, formatIfNotExists = []) {
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, JSON.stringify(formatIfNotExists));
  }
}

function readJSON(jsonFile, formatIfNotExists = []) {
  const fullPath = path.resolve(databasePath, `${jsonFile}.json`);

  createIfNotExists(fullPath, formatIfNotExists);

  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}

function writeJSON(jsonFile, data, formatIfNotExists = []) {
  const fullPath = path.resolve(databasePath, `${jsonFile}.json`);

  createIfNotExists(fullPath, formatIfNotExists);

  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf8");
}

export function activateExitGroup(groupId) {
  const filename = EXIT_GROUPS_FILE;

  const exitGroups = readJSON(filename);

  if (!exitGroups.includes(groupId)) {
    exitGroups.push(groupId);
  }

  writeJSON(filename, exitGroups);
}

export function deactivateExitGroup(groupId) {
  const filename = EXIT_GROUPS_FILE;

  const exitGroups = readJSON(filename);

  const index = exitGroups.indexOf(groupId);

  if (index === -1) {
    return;
  }

  exitGroups.splice(index, 1);

  writeJSON(filename, exitGroups);
}

export function isActiveExitGroup(groupId) {
  const filename = EXIT_GROUPS_FILE;

  const exitGroups = readJSON(filename);

  return exitGroups.includes(groupId);
}

export function activateWelcomeGroup(groupId) {
  const filename = WELCOME_GROUPS_FILE;

  const welcomeGroups = readJSON(filename);

  if (!welcomeGroups.includes(groupId)) {
    welcomeGroups.push(groupId);
  }

  writeJSON(filename, welcomeGroups);
}

export function deactivateWelcomeGroup(groupId) {
  const filename = WELCOME_GROUPS_FILE;

  const welcomeGroups = readJSON(filename);

  const index = welcomeGroups.indexOf(groupId);

  if (index === -1) {
    return;
  }

  welcomeGroups.splice(index, 1);

  writeJSON(filename, welcomeGroups);
}

export function isActiveWelcomeGroup(groupId) {
  const filename = WELCOME_GROUPS_FILE;

  const welcomeGroups = readJSON(filename);

  return welcomeGroups.includes(groupId);
}

export function activateGroup(groupId) {
  const filename = INACTIVE_GROUPS_FILE;

  const inactiveGroups = readJSON(filename);

  const index = inactiveGroups.indexOf(groupId);

  if (index === -1) {
    return;
  }

  inactiveGroups.splice(index, 1);

  writeJSON(filename, inactiveGroups);
}

export function deactivateGroup(groupId) {
  const filename = INACTIVE_GROUPS_FILE;

  const inactiveGroups = readJSON(filename);

  if (!inactiveGroups.includes(groupId)) {
    inactiveGroups.push(groupId);
  }

  writeJSON(filename, inactiveGroups);
}

export function isActiveGroup(groupId) {
  const filename = INACTIVE_GROUPS_FILE;

  const inactiveGroups = readJSON(filename);

  return !inactiveGroups.includes(groupId);
}

export function getAutoResponderResponse(match) {
  const filename = AUTO_RESPONDER_FILE;

  const responses = readJSON(filename);

  const matchUpperCase = match.toLocaleUpperCase();

  const data = responses.find(
    (response) => response.match.toLocaleUpperCase() === matchUpperCase
  );

  if (!data) {
    return null;
  }

  return data.answer;
}

export function activateAutoResponderGroup(groupId) {
  const filename = AUTO_RESPONDER_GROUPS_FILE;

  const autoResponderGroups = readJSON(filename);

  if (!autoResponderGroups.includes(groupId)) {
    autoResponderGroups.push(groupId);
  }

  writeJSON(filename, autoResponderGroups);
}

export function deactivateAutoResponderGroup(groupId) {
  const filename = AUTO_RESPONDER_GROUPS_FILE;

  const autoResponderGroups = readJSON(filename);

  const index = autoResponderGroups.indexOf(groupId);

  if (index === -1) {
    return;
  }

  autoResponderGroups.splice(index, 1);

  writeJSON(filename, autoResponderGroups);
}

export function isActiveAutoResponderGroup(groupId) {
  const filename = AUTO_RESPONDER_GROUPS_FILE;

  const autoResponderGroups = readJSON(filename);

  return autoResponderGroups.includes(groupId);
}

export function activateAntiLinkGroup(groupId) {
  const filename = ANTI_LINK_GROUPS_FILE;

  const antiLinkGroups = readJSON(filename);

  if (!antiLinkGroups.includes(groupId)) {
    antiLinkGroups.push(groupId);
  }

  writeJSON(filename, antiLinkGroups);
}

export function deactivateAntiLinkGroup(groupId) {
  const filename = ANTI_LINK_GROUPS_FILE;

  const antiLinkGroups = readJSON(filename);

  const index = antiLinkGroups.indexOf(groupId);

  if (index === -1) {
    return;
  }

  antiLinkGroups.splice(index, 1);

  writeJSON(filename, antiLinkGroups);
}

export function isActiveAntiLinkGroup(groupId) {
  const filename = ANTI_LINK_GROUPS_FILE;

  const antiLinkGroups = readJSON(filename);

  return antiLinkGroups.includes(groupId);
}

export function activateAutoStickerGroup(groupId) {
  const filename = AUTO_STICKER_GROUPS_FILE;

  const autoStickerGroups = readJSON(filename);

  if (!autoStickerGroups.includes(groupId)) {
    autoStickerGroups.push(groupId);
  }

  writeJSON(filename, autoStickerGroups);
}

export function deactivateAutoStickerGroup(groupId) {
  const filename = AUTO_STICKER_GROUPS_FILE;

  const autoStickerGroups = readJSON(filename);

  const index = autoStickerGroups.indexOf(groupId);

  if (index === -1) {
    return;
  }

  autoStickerGroups.splice(index, 1);

  writeJSON(filename, autoStickerGroups);
}

export function isActiveAutoStickerGroup(groupId) {
  const filename = AUTO_STICKER_GROUPS_FILE;

  const autoStickerGroups = readJSON(filename);

  return autoStickerGroups.includes(groupId);
}

export function muteMember(groupId, memberId) {
  const filename = MUTE_FILE;

  const mutedMembers = readJSON(filename, JSON.stringify({}));

  if (!mutedMembers[groupId]) {
    mutedMembers[groupId] = [];
  }

  if (!mutedMembers[groupId]?.includes(memberId)) {
    mutedMembers[groupId].push(memberId);
  }

  writeJSON(filename, mutedMembers);
}

export function unmuteMember(groupId, memberId) {
  const filename = MUTE_FILE;

  const mutedMembers = readJSON(filename, JSON.stringify({}));

  if (!mutedMembers[groupId]) {
    return;
  }

  const index = mutedMembers[groupId].indexOf(memberId);

  if (index !== -1) {
    mutedMembers[groupId].splice(index, 1);
  }

  writeJSON(filename, mutedMembers);
}

export function checkIfMemberIsMuted(groupId, memberId) {
  const filename = MUTE_FILE;

  const mutedMembers = readJSON(filename, JSON.stringify({}));

  if (!mutedMembers[groupId]) {
    return false;
  }

  return mutedMembers[groupId]?.includes(memberId);
}

export function activateOnlyAdmins(groupId) {
  const filename = ONLY_ADMINS_FILE;

  const onlyAdminsGroups = readJSON(filename, []);

  if (!onlyAdminsGroups.includes(groupId)) {
    onlyAdminsGroups.push(groupId);
  }

  writeJSON(filename, onlyAdminsGroups);
}

export function deactivateOnlyAdmins(groupId) {
  const filename = ONLY_ADMINS_FILE;

  const onlyAdminsGroups = readJSON(filename, []);

  const index = onlyAdminsGroups.indexOf(groupId);
  if (index === -1) {
    return;
  }

  onlyAdminsGroups.splice(index, 1);

  writeJSON(filename, onlyAdminsGroups);
}

export function isActiveOnlyAdmins(groupId) {
  const filename = ONLY_ADMINS_FILE;

  const onlyAdminsGroups = readJSON(filename, []);

  return onlyAdminsGroups.includes(groupId);
}

export function readGroupRestrictions() {
  return readJSON(GROUP_RESTRICTIONS_FILE, {});
}

export function saveGroupRestrictions(restrictions) {
  writeJSON(GROUP_RESTRICTIONS_FILE, restrictions, {});
}

export function isActiveGroupRestriction(groupId, restriction) {
  const restrictions = readGroupRestrictions();

  if (!restrictions[groupId]) {
    return false;
  }

  return restrictions[groupId][restriction] === true;
}

export function updateIsActiveGroupRestriction(groupId, restriction, isActive) {
  const restrictions = readGroupRestrictions();

  if (!restrictions[groupId]) {
    restrictions[groupId] = {};
  }

  restrictions[groupId][restriction] = isActive;

  saveGroupRestrictions(restrictions);
}

export function readRestrictedMessageTypes() {
  return readJSON(RESTRICTED_MESSAGES_FILE, {
    sticker: "stickerMessage",
    video: "videoMessage",
    image: "imageMessage",
    audio: "audioMessage",
    product: "productMessage",
    document: "documentMessage",
    event: "eventMessage",
  });
}

export function setPrefix(groupJid, prefix) {
  const filename = PREFIX_GROUPS_FILE;

  const prefixGroups = readJSON(filename, {});

  prefixGroups[groupJid] = prefix;

  writeJSON(filename, prefixGroups, {});
}

export function getPrefix(groupJid) {
  const filename = PREFIX_GROUPS_FILE;

  const prefixGroups = readJSON(filename, {});

  return prefixGroups[groupJid] || PREFIX;
}

export function listAutoResponderItems() {
  const filename = AUTO_RESPONDER_FILE;
  const responses = readJSON(filename, []);

  return responses.map((item, index) => ({
    key: index + 1,
    match: item.match,
    answer: item.answer,
  }));
}

export function addAutoResponderItem(match, answer) {
  const filename = AUTO_RESPONDER_FILE;
  const responses = readJSON(filename, []);

  const matchUpperCase = match.toLocaleUpperCase();

  const existingItem = responses.find(
    (response) => response.match.toLocaleUpperCase() === matchUpperCase
  );

  if (existingItem) {
    return false;
  }

  responses.push({
    match: match.trim(),
    answer: answer.trim(),
  });

  writeJSON(filename, responses, []);

  return true;
}

export function removeAutoResponderItemByKey(key) {
  const filename = AUTO_RESPONDER_FILE;
  const responses = readJSON(filename, []);

  const index = key - 1;

  if (index < 0 || index >= responses.length) {
    return false;
  }

  responses.splice(index, 1);

  writeJSON(filename, responses, []);

  return true;
}

export function setSpiderApiToken(token) {
  const filename = CONFIG_FILE;

  const config = readJSON(filename, {});

  config.spider_api_token = token;

  writeJSON(filename, config, {});
}

export function getSpiderApiToken() {
  const filename = CONFIG_FILE;

  const config = readJSON(filename, {});

  return config.spider_api_token || SPIDER_API_TOKEN;
}




const WELCOME_SETTINGS_FILE = "welcome-settings";

export function setWelcomeMessage(groupId, message) {
  const settings = readJSON(WELCOME_SETTINGS_FILE, {});
  if (!settings[groupId]) {
    settings[groupId] = {};
  }
  settings[groupId].message = message;
  writeJSON(WELCOME_SETTINGS_FILE, settings, {});
}

export function setWelcomeRules(groupId, rules) {
  const settings = readJSON(WELCOME_SETTINGS_FILE, {});
  if (!settings[groupId]) {
    settings[groupId] = {};
  }
  settings[groupId].rules = rules;
  writeJSON(WELCOME_SETTINGS_FILE, settings, {});
}

export function setWelcomeImage(groupId, base64Image) {
  const settings = readJSON(WELCOME_SETTINGS_FILE, {});
  if (!settings[groupId]) {
    settings[groupId] = {};
  }
  settings[groupId].image = base64Image;
  writeJSON(WELCOME_SETTINGS_FILE, settings, {});
}

export function getWelcomeSettings(groupId) {
  const settings = readJSON(WELCOME_SETTINGS_FILE, {});
  return settings[groupId] || null;
}

export function resetWelcomeSettings(groupId) {
  const settings = readJSON(WELCOME_SETTINGS_FILE, {});
  if (settings[groupId]) {
    delete settings[groupId];
    writeJSON(WELCOME_SETTINGS_FILE, settings, {});
  }
}

export function removeWelcomeMessage(groupId) {
  const settings = readJSON(WELCOME_SETTINGS_FILE, {});
  if (settings[groupId]) {
    delete settings[groupId].message;
    if (Object.keys(settings[groupId]).length === 0) {
      delete settings[groupId];
    }
    writeJSON(WELCOME_SETTINGS_FILE, settings, {});
  }
}

export function removeWelcomeImage(groupId) {
  const settings = readJSON(WELCOME_SETTINGS_FILE, {});
  if (settings[groupId]) {
    delete settings[groupId].image;
    if (Object.keys(settings[groupId]).length === 0) {
      delete settings[groupId];
    }
    writeJSON(WELCOME_SETTINGS_FILE, settings, {});
  }
}

const GROUP_SCHEDULE_FILE = "group-schedules";

export function setGroupSchedule(groupId, schedule) {
  const schedules = readJSON(GROUP_SCHEDULE_FILE, {});
  schedules[groupId] = schedule;
  writeJSON(GROUP_SCHEDULE_FILE, schedules, {});
}

export function getGroupSchedule(groupId) {
  const schedules = readJSON(GROUP_SCHEDULE_FILE, {});
  return schedules[groupId] || null;
}

export function removeGroupSchedule(groupId) {
  const schedules = readJSON(GROUP_SCHEDULE_FILE, {});
  if (schedules[groupId]) {
    delete schedules[groupId];
    writeJSON(GROUP_SCHEDULE_FILE, schedules, {});
  }
}

export function getAllActiveSchedules() {
  const schedules = readJSON(GROUP_SCHEDULE_FILE, {});
  const active = {};
  for (const [groupId, schedule] of Object.entries(schedules)) {
    if (schedule.active) {
      active[groupId] = schedule;
    }
  }
  return active;
}

const ANTI_LINK_WARN_FILE = "anti-link-warn";
const ANTI_LINK_WARN_COUNT_FILE = "anti-link-warn-count";
const ANTI_FLOOD_FILE = "anti-flood";
const ANTI_FLOOD_CONFIG_FILE = "anti-flood-config";
const FLOOD_MESSAGES_FILE = "flood-messages";

// ===== ANTI-LINK COM AVISOS =====
export function activateAntiLinkWarn(groupId) {
  const data = readJSON(ANTI_LINK_WARN_FILE, []);
  if (!data.includes(groupId)) {
    data.push(groupId);
    writeJSON(ANTI_LINK_WARN_FILE, data, []);
  }
}

export function deactivateAntiLinkWarn(groupId) {
  const data = readJSON(ANTI_LINK_WARN_FILE, []);
  const index = data.indexOf(groupId);
  if (index !== -1) {
    data.splice(index, 1);
    writeJSON(ANTI_LINK_WARN_FILE, data, []);
  }
}

export function isActiveAntiLinkWarn(groupId) {
  const data = readJSON(ANTI_LINK_WARN_FILE, []);
  return data.includes(groupId);
}

export function addLinkWarn(groupId, userLid) {
  const warns = readJSON(ANTI_LINK_WARN_COUNT_FILE, {});
  if (!warns[groupId]) warns[groupId] = {};
  if (!warns[groupId][userLid]) warns[groupId][userLid] = 0;
  warns[groupId][userLid]++;
  writeJSON(ANTI_LINK_WARN_COUNT_FILE, warns, {});
  return warns[groupId][userLid];
}

export function getLinkWarns(groupId) {
  const warns = readJSON(ANTI_LINK_WARN_COUNT_FILE, {});
  return warns[groupId] || {};
}

export function resetLinkWarns(groupId, userLid) {
  const warns = readJSON(ANTI_LINK_WARN_COUNT_FILE, {});
  if (warns[groupId] && warns[groupId][userLid]) {
    delete warns[groupId][userLid];
    writeJSON(ANTI_LINK_WARN_COUNT_FILE, warns, {});
  }
}

// ===== ANTI-FLOOD =====
export function activateAntiFlood(groupId) {
  const data = readJSON(ANTI_FLOOD_FILE, []);
  if (!data.includes(groupId)) {
    data.push(groupId);
    writeJSON(ANTI_FLOOD_FILE, data, []);
  }
}

export function deactivateAntiFlood(groupId) {
  const data = readJSON(ANTI_FLOOD_FILE, []);
  const index = data.indexOf(groupId);
  if (index !== -1) {
    data.splice(index, 1);
    writeJSON(ANTI_FLOOD_FILE, data, []);
  }
}

export function isActiveAntiFlood(groupId) {
  const data = readJSON(ANTI_FLOOD_FILE, []);
  return data.includes(groupId);
}

export function setFloodConfig(groupId, config) {
  const configs = readJSON(ANTI_FLOOD_CONFIG_FILE, {});
  configs[groupId] = config;
  writeJSON(ANTI_FLOOD_CONFIG_FILE, configs, {});
}

export function getFloodConfig(groupId) {
  const configs = readJSON(ANTI_FLOOD_CONFIG_FILE, {});
  return configs[groupId] || null;
}

export function getFloodMessages(groupId) {
  return readJSON(FLOOD_MESSAGES_FILE, {})[groupId] || {};
}

export function addFloodMessage(groupId, userLid) {
  const data = readJSON(FLOOD_MESSAGES_FILE, {});
  if (!data[groupId]) data[groupId] = {};
  if (!data[groupId][userLid]) data[groupId][userLid] = [];
  data[groupId][userLid].push(Date.now());
  // Remove mensagens com mais de 10 segundos
  data[groupId][userLid] = data[groupId][userLid].filter(t => Date.now() - t < 10000);
  writeJSON(FLOOD_MESSAGES_FILE, data, {});
  return data[groupId][userLid].length;
}

export function clearFloodMessages(groupId, userLid) {
  const data = readJSON(FLOOD_MESSAGES_FILE, {});
  if (data[groupId] && data[groupId][userLid]) {
    delete data[groupId][userLid];
    writeJSON(FLOOD_MESSAGES_FILE, data, {});
  }
}

const BLOCKED_WORDS_FILE = "blocked-words";
const BLOCK_WORDS_ACTIVE_FILE = "block-words-active";
const BLACKLIST_FILE = "blacklist";

// ===== BLOQUEIO DE PALAVRAS =====
export function activateBlockWords(groupId) {
  const data = readJSON(BLOCK_WORDS_ACTIVE_FILE, []);
  if (!data.includes(groupId)) {
    data.push(groupId);
    writeJSON(BLOCK_WORDS_ACTIVE_FILE, data, []);
  }
}

export function deactivateBlockWords(groupId) {
  const data = readJSON(BLOCK_WORDS_ACTIVE_FILE, []);
  const index = data.indexOf(groupId);
  if (index !== -1) {
    data.splice(index, 1);
    writeJSON(BLOCK_WORDS_ACTIVE_FILE, data, []);
  }
}

export function isActiveBlockWords(groupId) {
  return readJSON(BLOCK_WORDS_ACTIVE_FILE, []).includes(groupId);
}

export function addBlockedWord(groupId, word) {
  const data = readJSON(BLOCKED_WORDS_FILE, {});
  if (!data[groupId]) data[groupId] = [];
  if (!data[groupId].includes(word)) {
    data[groupId].push(word);
    writeJSON(BLOCKED_WORDS_FILE, data, {});
  }
}

export function removeBlockedWord(groupId, word) {
  const data = readJSON(BLOCKED_WORDS_FILE, {});
  if (data[groupId]) {
    data[groupId] = data[groupId].filter(w => w !== word);
    writeJSON(BLOCKED_WORDS_FILE, data, {});
  }
}

export function getBlockedWords(groupId) {
  const data = readJSON(BLOCKED_WORDS_FILE, {});
  return data[groupId] || [];
}

// ===== LISTA NEGRA =====
export function addBlacklist(groupId, number) {
  const data = readJSON(BLACKLIST_FILE, {});
  if (!data[groupId]) data[groupId] = [];
  if (!data[groupId].includes(number)) {
    data[groupId].push(number);
    writeJSON(BLACKLIST_FILE, data, {});
  }
}

export function removeBlacklist(groupId, number) {
  const data = readJSON(BLACKLIST_FILE, {});
  if (data[groupId]) {
    data[groupId] = data[groupId].filter(n => n !== number);
    writeJSON(BLACKLIST_FILE, data, {});
  }
}

export function getBlacklist(groupId) {
  const data = readJSON(BLACKLIST_FILE, {});
  return data[groupId] || [];
}

export function isBlacklisted(groupId, number) {
  const data = readJSON(BLACKLIST_FILE, {});
  return data[groupId]?.includes(number) || false;
}