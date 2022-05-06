const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { SUGGESTIONS } = require("@root/config");
const { addSuggestion } = require("@schemas/Suggestions");
const { stripIndent } = require("common-tags");
const { sendMessage } = require("@utils/botUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "suggest",
  description: "submit a suggestion",
  category: "SUGGESTION",
  cooldown: 20,
  command: {
    enabled: true,
    usage: "<suggestion>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "suggestion",
        description: "the suggestion",
        type: "STRING",
        required: true,
      },
    ],
  },

  async messageRun(message, args, data) {
    const suggestion = args.join(" ");
    const response = await suggest(message.member, suggestion, data.settings);
    if (typeof response === "boolean") return sendMessage(message.channel, "Your suggestion has been submitted!", 5);
    else await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const suggestion = interaction.options.getString("suggestion");
    const response = await suggest(interaction.member, suggestion, data.settings);
    if (typeof response === "boolean") interaction.followUp("Your suggestion has been submitted!");
    else await interaction.followUp(response);
  },
};

/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} suggestion
 * @param {object} settings
 */
async function suggest(member, suggestion, settings) {
  if (!settings.suggestions.enabled) return "Suggestion system is disabled.";
  if (!settings.suggestions.channel_id) return "Suggestion channel not configured!";
  const channel = member.guild.channels.cache.get(settings.suggestions.channel_id);
  if (!channel) return "Suggestion channel not found!";

  const embed = new MessageEmbed()
    .setAuthor({ name: "New Suggestion" })
    .setThumbnail(member.user.avatarURL())
    .setColor(SUGGESTIONS.DEFAULT_EMBED)
    .setDescription(
      stripIndent`
        ${suggestion}

        **Submitter** 
        ${member.user.tag} [${member.id}]
      `
    )
    .setTimestamp();

  let buttonsRow = new MessageActionRow().addComponents(
    new MessageButton().setCustomId("SUGGEST_APPROVE").setLabel("Approve").setStyle("SUCCESS"),
    new MessageButton().setCustomId("SUGGEST_REJECT").setLabel("Reject").setStyle("DANGER"),
    new MessageButton().setCustomId("SUGGEST_DELETE").setLabel("Delete").setStyle("SECONDARY")
  );

  try {
    const sentMsg = await channel.send({
      embeds: [embed],
      components: [buttonsRow],
    });

    await sentMsg.react(SUGGESTIONS.EMOJI.UP_VOTE);
    await sentMsg.react(SUGGESTIONS.EMOJI.DOWN_VOTE);

    await addSuggestion(sentMsg, member.id, suggestion);

    return true;
  } catch (ex) {
    member.client.logger.error("suggest", ex);
    return "Failed to send message to suggestions channel!";
  }
}
