import db, { Conversation, MessageAttachment } from "./db";
import * as XMTP from "@xmtp/xmtp-js";
import {
  Attachment,
  ContentTypeAttachment,
  ContentTypeRemoteAttachment,
  RemoteAttachment,
  RemoteAttachmentCodec,
} from "@xmtp/content-type-remote-attachment";
import { ContentTypeReply, Reply } from "@xmtp/content-type-reply";
import { deleteReaction, persistReaction } from "./reactions";
import { ContentTypeReaction, Reaction } from "@xmtp/content-type-reaction";

export async function process(
  client: XMTP.Client,
  conversation: Conversation,
  message: {
    id: number;
    content: any;
    contentType: XMTP.ContentTypeId;
    senderAddress: string;
  }
) {
  const { content, contentType, id: messageID } = message;

  if (ContentTypeReply.sameAs(contentType)) {
    const reply = content as Reply;
    await db.messages.update(message.id, {
      inReplyToID: reply.reference,
    });
  }

  if (ContentTypeAttachment.sameAs(contentType)) {
    const attachment = content as Attachment;
    const messageAttachment: MessageAttachment = {
      messageID,
      ...attachment,
    };

    await db.attachments.add(messageAttachment);
  }

  if (ContentTypeRemoteAttachment.sameAs(contentType)) {
    const remoteAttachment = content as RemoteAttachment;
    const attachment: Attachment = await RemoteAttachmentCodec.load(
      remoteAttachment,
      client
    );

    const messageAttachment: MessageAttachment = {
      messageID,
      ...attachment,
    };

    await db.attachments.add(messageAttachment);
  }

  if (XMTP.ContentTypeGroupChatTitleChanged.sameAs(contentType)) {
    const titleChanged = content as XMTP.GroupChatTitleChanged;

    await db.conversations.update(conversation, {
      title: titleChanged.newTitle,
    });
  }

  if (XMTP.ContentTypeGroupChatMemberAdded.sameAs(contentType)) {
    const memberAdded = content as XMTP.GroupChatMemberAdded;

    const groupMembers = new Set(conversation.groupMembers);
    groupMembers.add(memberAdded.member);

    await db.conversations.update(conversation, {
      groupMembers: Array.from(groupMembers),
    });
  }

  if (ContentTypeReaction.sameAs(message.contentType as XMTP.ContentTypeId)) {
    const reaction: Reaction = message.content;

    if (reaction.action == "removed") {
      await deleteReaction({
        messageXMTPID: reaction.reference,
        reactor: message.senderAddress,
        name: reaction.content,
      });
    } else {
      await persistReaction({
        reactor: message.senderAddress,
        name: reaction.content,
        messageXMTPID: reaction.reference,
      });
    }
  }
}
