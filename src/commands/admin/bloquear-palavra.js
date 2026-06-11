import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  addBlockedWord,
  removeBlockedWord,
  getBlockedWords,
  isActiveBlockWords,
  activateBlockWords,
  deactivateBlockWords,
} from "../../utils/database.js";

const PALAVRAS_PADRAO = [
  "caralho", "caralhos", "carai", "karai", "karaio", "cralh",
  "porra", "porras", "poha", "poarr",
  "desgraça", "desgraca", "desgraçado", "desgraçada", "desgracado", "desgracada",
  "fdp", "f.d.p", "f d p",
  "filho da puta", "filha da puta", "filho de rapariga", "filha de rapariga", "fi da puta", "fdp do crl",
  "arrombado", "arrombada",
  "buceta", "bct", "bucetinha", "xereca",
  "bosta", "merda", "merdas", "mrd",
  "cacete", "cacetes",
  "puta", "putas", "puto", "putos", "putinha",
  "viado", "viada", "viados", "viadas", "viadinho", "viadão",
  "bicha", "bichas", "baitola", "baitolas",
  "otario", "otária", "otarios", "otarias", "otário","pica", "pika", "piroca", "piroka", "pinto", "pint*", "pau", "pauzudo", "pauzuda",
"rola", "roludo", "roluda", "buceta", "bct", "xereca", "xota", "xoxota",
"peito", "peitos", "teta", "tetas", "seios",
"cuzinho", "cuzão", "dar o cu", "comer o cu", "comi o cu",
"chupa", "chupar", "chupeta", "mamar", "mamada",
"gozar", "gozei", "gozou", "gozo", "esporrar", "esporrada",
"punheta", "punhetinha", "punheteiro", "bronha", "tocar uma",
"transar", "transa", "trepar", "trepada", "meter", "meteu",
"siririca", "masturbar", "masturbação",
"cuzão", "cusão", "cuzuda",
"pirocudo", "pirocuda", "roludo", "roluda",
"caceta", "cacete", "bagos", "saco", "saco", "bolas",
"viado", "viadinho", "bicha", "bichinha", "baitola",
"sapatão", "sapatona", "traveco", "travesti",
"prostituta", "prostituto", "garota de programa", "garoto de programa",
  "babaca", "babacas", "babacaozinho",
  "idiota", "idiotas",
  "imbecil", "imbecis",
  "cretino", "cretina", "cretinos", "cretinas",
  "vadia", "vadias", "vadiaozinha",
  "vagabundo", "vagabunda", "vagabundos", "vagabundas",
  "desgraçada", "desgraçado", "maldito", "maldita", "malditos", "malditas",
  "piranha", "piranhas", "piranhuda",
  "corno", "corna", "cornos", "cornas",
  "escroto", "escrota", "escrotos", "escrotas",
  "trouxa", "trouxas",
  "fudido", "fudida", "fudidos", "fudidas",
  "foder", "foda", "foda-se", "fodase", "fds", "fuder", "fudeu",
  "pqp", "puta que pariu", "puta q pariu", "putaquepariu",
  "vsf", "vai se fuder", "vai se foder",
  "tnc", "tomar no cu", "tomar no cú", "tomanocu", "tmnc", "tomarnocu",
  "vtnc", "vaitomanocu", "vai tnc",
  "seu lixo", "sua lixo", "você é um lixo", "lixo humano",
  "retardado", "retardada",
  "demente",
  "nojento", "nojenta",
  "fracassado", "fracassada",
  "inútil", "inutil", "inuteis",
  "burro", "burra",
  "ignorante",
  "canalha",
  "safado", "safada",
  "sem vergonha", "semvergonha", "cara de pau",
  "peste",
  "capeta", "demonio", "demônio", "satanás",
  "praga",
  "desalmado",
  "maldoso", "maldosa",
  "cruel",
  "traidor", "traidora",
  "falso", "falsa",
  "mentiroso", "mentirosa",
  "pilantra",
  "caloteiro", "caloteira",
  "x9", "dedo duro", "dedoduro", "cagueta",
  "alcaguete",
  "puxa saco", "puxasaco", "puxa-saco",
];

export default {
  name: "bloquear-palavra",
  description: "Bloqueia palavras proibidas no grupo.",
  commands: ["bloquear-palavra", "blockword", "bp", "palavra-proibida"],
  usage: `${PREFIX}bloquear-palavra (1/0)\n${PREFIX}bloquear-palavra add | palavra\n${PREFIX}bloquear-palavra remove | palavra\n${PREFIX}bloquear-palavra list`,

  handle: async ({
    args,
    remoteJid,
    sendReply,
    sendSuccessReply,
    sendErrorReply,
    sendSuccessReact,
  }) => {
    try {
      if (!args.length) {
        const isActive = isActiveBlockWords(remoteJid);
        const status = isActive ? "ATIVADO" : "DESATIVADO";
        const words = getBlockedWords(remoteJid);
        const todas = [...new Set([...PALAVRAS_PADRAO, ...words])];
        const wordList = todas.length > 0 ? todas.join(", ") : "Nenhuma";

        return sendReply(
          `🚫 *Bloqueio de Palavras*\n\n` +
          `Status: ${status}\n` +
          `Palavras: ${wordList}\n\n` +
          `• ${PREFIX}bloquear-palavra 1\n` +
          `• ${PREFIX}bloquear-palavra 0\n` +
          `• ${PREFIX}bloquear-palavra add | palavra\n` +
          `• ${PREFIX}bloquear-palavra remove | palavra\n` +
          `• ${PREFIX}bloquear-palavra list\n\n` +
          `📌 ${PALAVRAS_PADRAO.length} palavrões já inclusos por padrão!`
        );
      }

      const action = args[0].toLowerCase();

      if (action === "1" || action === "on") {
        activateBlockWords(remoteJid);
        for (const palavra of PALAVRAS_PADRAO) {
          try { addBlockedWord(remoteJid, palavra); } catch (e) {}
        }
        await sendSuccessReact();
        return sendReply(`🚫 *Bloqueio de palavras ATIVADO!*\n${PALAVRAS_PADRAO.length} palavrões já foram adicionados.`);
      }

      if (action === "0" || action === "off") {
        deactivateBlockWords(remoteJid);
        await sendSuccessReact();
        return sendReply("🚫 *Bloqueio de palavras DESATIVADO!*");
      }

      if (action === "add" || action === "adicionar") {
        const word = args.slice(1).join(" ").toLowerCase().trim();
        if (!word) throw new InvalidParameterError("Digite a palavra!\nEx: /bp add | boboca");
        addBlockedWord(remoteJid, word);
        await sendSuccessReact();
        return sendReply(`✅ Palavra "${word}" bloqueada!`);
      }

      if (action === "remove" || action === "remover" || action === "del") {
        const word = args.slice(1).join(" ").toLowerCase().trim();
        if (!word) throw new InvalidParameterError("Digite a palavra!\nEx: /bp remove | boboca");
        removeBlockedWord(remoteJid, word);
        await sendSuccessReact();
        return sendReply(`✅ Palavra "${word}" removida!`);
      }

      if (action === "list" || action === "lista") {
        const words = getBlockedWords(remoteJid);
        const todas = [...new Set([...PALAVRAS_PADRAO, ...words])];
        if (todas.length === 0) return sendReply("Nenhuma palavra bloqueada.");
        return sendReply(`🚫 *Palavras bloqueadas:*\n${todas.join("\n")}`);
      }

      throw new InvalidParameterError("Use: 1, 0, add, remove ou list");
    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};