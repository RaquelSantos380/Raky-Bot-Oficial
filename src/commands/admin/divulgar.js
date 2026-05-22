import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import fs from "fs";
import path from "path";

const MENSAGENS_FILE = path.resolve("database", "mensagens-salvas.json");
const AGENDAMENTOS_FILE = path.resolve("database", "agendamentos.json");

function lerMensagens() {
  try {
    if (fs.existsSync(MENSAGENS_FILE)) {
      return JSON.parse(fs.readFileSync(MENSAGENS_FILE, "utf8"));
    }
  } catch (e) {}
  return [];
}

function salvarMensagens(lista) {
  fs.writeFileSync(MENSAGENS_FILE, JSON.stringify(lista, null, 2));
}

function lerAgendamentos() {
  try {
    if (fs.existsSync(AGENDAMENTOS_FILE)) {
      return JSON.parse(fs.readFileSync(AGENDAMENTOS_FILE, "utf8"));
    }
  } catch (e) {}
  return {};
}

function salvarAgendamentos(lista) {
  const paraSalvar = {};
  for (const [key, value] of Object.entries(lista)) {
    paraSalvar[key] = {
      tipo: value.tipo,
      gruposIds: value.gruposIds,
      texto: value.texto || "",
      minutos: value.minutos,
      base64: value.base64 || ""
    };
  }
  fs.writeFileSync(AGENDAMENTOS_FILE, JSON.stringify(paraSalvar, null, 2));
}

// Cache de intervalos ativos
const intervalosAtivos = {};

export function iniciarAgendamentos(socket) {
  const agendamentosSalvos = lerAgendamentos();
  
  for (const [key, data] of Object.entries(agendamentosSalvos)) {
    if (intervalosAtivos[key]) {
      clearInterval(intervalosAtivos[key]);
    }

    if (data.tipo === "texto") {
      intervalosAtivos[key] = setInterval(async () => {
        for (const id of data.gruposIds) {
          try {
            await socket.sendMessage(id, { text: data.texto });
            await new Promise(r => setTimeout(r, 2000));
          } catch (e) {}
        }
      }, data.minutos * 60000);
    }

    if (data.tipo === "foto" && data.base64) {
      intervalosAtivos[key] = setInterval(async () => {
        for (const id of data.gruposIds) {
          try {
            await socket.sendMessage(id, { 
              image: Buffer.from(data.base64, "base64"), 
              caption: data.texto || "" 
            });
            await new Promise(r => setTimeout(r, 2000));
          } catch (e) {}
        }
      }, data.minutos * 60000);
    }
  }
}

export function pararAgendamentos() {
  for (const [key, interval] of Object.entries(intervalosAtivos)) {
    clearInterval(interval);
    delete intervalosAtivos[key];
  }
}

export default {
  name: "divulgar",
  description: "Envia mensagem para grupos do WhatsApp.",
  commands: ["divulgar", "div", "grupos"],
  usage: `${PREFIX}divulgar | mensagem\n${PREFIX}grupos\n${PREFIX}divulgar enviar | ID | mensagem`,

  handle: async ({
    args,
    remoteJid,
    socket,
    webMessage,
    sendReply,
    sendSuccessReply,
    sendErrorReply,
    sendWaitReact,
    sendSuccessReact,
  }) => {
    try {
      if (!args.length) {
        if (webMessage?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
          return await divulgarImagem(socket, webMessage, "", sendReply, sendSuccessReact);
        }
        return sendReply(
          `📢 *Divulgação*\n\n` +
          `• ${PREFIX}divulgar | mensagem\n` +
          `  Envia para TODOS os grupos\n\n` +
          `• ${PREFIX}grupos\n` +
          `  Lista grupos com IDs\n\n` +
          `• ${PREFIX}divulgar enviar | ID1 | ID2 | mensagem\n` +
          `  Envia para grupos específicos\n\n` +
          `• ${PREFIX}divulgar agendar | minutos | ID | mensagem\n` +
          `  Agenda divulgação recorrente\n\n` +
          `• ${PREFIX}divulgar agendarfoto | minutos | ID | legenda\n` +
          `  (Responda uma foto) Agenda com imagem\n\n` +
          `• ${PREFIX}divulgar parar\n` +
          `  Para agendamento\n\n` +
          `• ${PREFIX}divulgar salvar | mensagem\n` +
          `• ${PREFIX}divulgar lista\n` +
          `• ${PREFIX}divulgar usar | 1\n` +
          `• ${PREFIX}divulgar deletar | 1\n\n` +
          `📸 *Foto:* Responda uma foto com ${PREFIX}divulgar | legenda`
        );
      }

      const action = args[0].toLowerCase();

      // LISTAR GRUPOS
      if (action === "grupos" || action === "groups") {
        const chats = await socket.groupFetchAllParticipating();
        const grupos = Object.values(chats);
        if (grupos.length === 0) return sendReply("Nenhum grupo encontrado.");
        let msg = `📊 *GRUPOS (${grupos.length})*\n\n`;
        grupos.forEach((g, i) => {
          msg += `${i + 1}. *${g.subject}*\n   🆔 \`${g.id}\`\n\n`;
        });
        return sendReply(msg);
      }

      // PARAR AGENDAMENTO
      if (action === "parar" || action === "stop") {
        const keys = Object.keys(intervalosAtivos).filter(k => k.startsWith(remoteJid));
        if (keys.length > 0) {
          keys.forEach(k => {
            clearInterval(intervalosAtivos[k]);
            delete intervalosAtivos[k];
          });
          // Também remove do arquivo
          const agendamentosSalvos = lerAgendamentos();
          keys.forEach(k => delete agendamentosSalvos[k]);
          salvarAgendamentos(agendamentosSalvos);
          return sendReply("⏹️ Agendamento cancelado!");
        }
        return sendReply("Nenhum agendamento ativo.");
      }

      // AGENDAR TEXTO
      if (action === "agendar" || action === "schedule") {
        const minutos = parseInt(args[1]);
        const gruposIds = args.slice(2).filter(a => a.includes("@g.us"));
        const texto = args.slice(2).filter(a => !a.includes("@g.us")).join(" ").trim();

        if (!minutos || minutos < 1) throw new InvalidParameterError("Digite os minutos!\nEx: !divulgar agendar | 5 | ID | msg");
        if (gruposIds.length === 0) throw new InvalidParameterError("Mencione os IDs dos grupos!");
        if (!texto) throw new InvalidParameterError("Digite a mensagem!");

        const key = remoteJid + "_texto";

        // Para agendamento anterior
        if (intervalosAtivos[key]) {
          clearInterval(intervalosAtivos[key]);
        }

        // Envia primeira vez
        for (const id of gruposIds) {
          try {
            await socket.sendMessage(id, { text: texto });
            await new Promise(r => setTimeout(r, 2000));
          } catch (e) {}
        }

        // Agenda
        intervalosAtivos[key] = setInterval(async () => {
          for (const id of gruposIds) {
            try {
              await socket.sendMessage(id, { text: texto });
              await new Promise(r => setTimeout(r, 2000));
            } catch (e) {}
          }
        }, minutos * 60000);

        // Salva no arquivo
        const agendamentosSalvos = lerAgendamentos();
        agendamentosSalvos[key] = {
          tipo: "texto",
          gruposIds,
          texto,
          minutos,
          base64: ""
        };
        salvarAgendamentos(agendamentosSalvos);

        return sendReply(`⏰ Agendado a cada ${minutos}min!\nUse ${PREFIX}divulgar parar para cancelar.`);
      }

      // AGENDAR FOTO
      if (action === "agendarfoto" || action === "agendafoto") {
        const minutos = parseInt(args[1]);
        const gruposIds = args.slice(2).filter(a => a.includes("@g.us"));
        const texto = args.slice(2).filter(a => !a.includes("@g.us")).join(" ").trim();

        if (!minutos || minutos < 1) throw new InvalidParameterError("Digite os minutos!\nEx: !divulgar agendarfoto | 5 | ID | legenda");
        if (gruposIds.length === 0) throw new InvalidParameterError("Mencione os IDs dos grupos!");

        const quotedMessage = webMessage?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const isQuotedImage = quotedMessage?.imageMessage;
        if (!isQuotedImage) throw new InvalidParameterError("Responda uma foto!");

        const { downloadContentFromMessage } = await import("baileys");
        const stream = await downloadContentFromMessage(isQuotedImage, "image");
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        const base64 = buffer.toString("base64");

        const key = remoteJid + "_foto";

        // Para agendamento anterior
        if (intervalosAtivos[key]) {
          clearInterval(intervalosAtivos[key]);
        }

        // Envia primeira vez
        for (const id of gruposIds) {
          try {
            await socket.sendMessage(id, { 
              image: Buffer.from(base64, "base64"), 
              caption: texto || "" 
            });
            await new Promise(r => setTimeout(r, 2000));
          } catch (e) {}
        }

        // Agenda
        intervalosAtivos[key] = setInterval(async () => {
          for (const id of gruposIds) {
            try {
              await socket.sendMessage(id, { 
                image: Buffer.from(base64, "base64"), 
                caption: texto || "" 
              });
              await new Promise(r => setTimeout(r, 2000));
            } catch (e) {}
          }
        }, minutos * 60000);

        // Salva no arquivo
        const agendamentosSalvos = lerAgendamentos();
        agendamentosSalvos[key] = {
          tipo: "foto",
          gruposIds,
          texto,
          minutos,
          base64
        };
        salvarAgendamentos(agendamentosSalvos);

        return sendReply(`⏰📸 Agendado com foto a cada ${minutos}min!\nUse ${PREFIX}divulgar parar para cancelar.`);
      }

      // ENVIAR PARA GRUPOS ESPECÍFICOS
      if (action === "enviar") {
        const gruposIds = args.slice(1).filter(a => a.includes("@g.us"));
        const texto = args.slice(1).filter(a => !a.includes("@g.us")).join(" ").trim();
        if (gruposIds.length === 0) throw new InvalidParameterError("Mencione os IDs dos grupos!");
        if (!texto) throw new InvalidParameterError("Digite a mensagem!");
        await sendSuccessReact();
        let sucessos = 0;
        for (const id of gruposIds) {
          try {
            await socket.sendMessage(id, { text: texto });
            sucessos++;
            await new Promise(r => setTimeout(r, 2000));
          } catch (e) {}
        }
        return sendReply(`✅ Enviado para ${sucessos}/${gruposIds.length} grupos!`);
      }

      // DIVULGAR IMAGEM (responder foto)
      if (webMessage?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
        const texto = args.join(" ").trim();
        return await divulgarImagem(socket, webMessage, texto, sendReply, sendSuccessReact);
      }

      // SALVAR MENSAGEM
      if (action === "salvar" || action === "save") {
        const texto = args.slice(1).join(" ").trim();
        if (!texto) throw new InvalidParameterError("Digite a mensagem!");
        const lista = lerMensagens();
        lista.push({ id: lista.length + 1, texto, data: new Date().toISOString() });
        salvarMensagens(lista);
        await sendSuccessReact();
        return sendReply(`✅ Mensagem salva! ID: ${lista.length}`);
      }

      // LISTAR MENSAGENS
      if (action === "lista" || action === "list") {
        const lista = lerMensagens();
        if (lista.length === 0) return sendReply("Nenhuma mensagem salva.");
        let msg = "💾 *Mensagens Salvas:*\n\n";
        lista.forEach((m, i) => {
          const previa = m.texto.length > 40 ? m.texto.substring(0, 40) + "..." : m.texto;
          msg += `${i + 1}. ${previa}\n`;
        });
        return sendReply(msg);
      }

      // USAR MENSAGEM
      if (action === "usar" || action === "use") {
        const index = parseInt(args[1]) - 1;
        const lista = lerMensagens();
        if (!lista[index]) throw new InvalidParameterError("Mensagem não encontrada!");
        return await enviarParaTodos(socket, lista[index].texto, sendReply, sendSuccessReact);
      }

      // DELETAR MENSAGEM
      if (action === "deletar" || action === "del") {
        const index = parseInt(args[1]) - 1;
        const lista = lerMensagens();
        if (!lista[index]) throw new InvalidParameterError("Mensagem não encontrada!");
        lista.splice(index, 1);
        lista.forEach((m, i) => (m.id = i + 1));
        salvarMensagens(lista);
        await sendSuccessReact();
        return sendReply("✅ Mensagem deletada!");
      }

      // DIVULGAR PARA TODOS
      const texto = args.join(" ").trim();
      return await enviarParaTodos(socket, texto, sendReply, sendSuccessReact);

    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};

async function divulgarImagem(socket, webMessage, texto, sendReply, sendSuccessReact) {
  const isQuotedImage = webMessage.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
  await sendSuccessReact();
  const { downloadContentFromMessage } = await import("baileys");
  const stream = await downloadContentFromMessage(isQuotedImage, "image");
  let buffer = Buffer.from([]);
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

  const chats = await socket.groupFetchAllParticipating();
  const grupos = Object.values(chats);
  let sucessos = 0;
  for (const grupo of grupos) {
    try {
      await socket.sendMessage(grupo.id, { image: buffer, caption: texto || "" });
      sucessos++;
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {}
  }
  return sendReply(`✅ Imagem divulgada em ${sucessos}/${grupos.length} grupos!`);
}

async function enviarParaTodos(socket, texto, sendReply, sendSuccessReact) {
  await sendSuccessReact();
  await sendReply("🚀 Buscando grupos...");
  const chats = await socket.groupFetchAllParticipating();
  const grupos = Object.values(chats);
  if (grupos.length === 0) return sendReply("❌ Nenhum grupo encontrado!");
  let sucessos = 0;
  let erros = 0;
  for (const grupo of grupos) {
    try {
      await socket.sendMessage(grupo.id, { text: texto });
      sucessos++;
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) { erros++; }
  }
  return sendReply(`✅ *Divulgação concluída!*\n\n📊 Grupos: ${grupos.length}\n✅ Sucessos: ${sucessos}\n❌ Erros: ${erros}`);
}
