export default {
  name: "grupos",
  description: "Lista todos os grupos que o bot participa.",
  commands: ["grupos", "groups", "listargrupos"],
  handle: async ({ socket, sendReply }) => {
    try {
      const chats = await socket.groupFetchAllParticipating();
      const grupos = Object.values(chats);
      
      if (grupos.length === 0) return sendReply("Nenhum grupo encontrado.");
      
      let msg = `📊 *GRUPOS (${grupos.length})*\n\n`;
      grupos.forEach((g, i) => {
        msg += `${i + 1}. *${g.subject}*\n   🆔 \`${g.id}\`\n\n`;
      });
      return sendReply(msg);
    } catch (e) {
      return sendReply("❌ Erro ao listar grupos.");
    }
  },
};
