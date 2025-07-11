/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {LexicalEditor} from 'lexical';
import 'material-symbols';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$createTextNode, TextNode} from 'lexical';
import {useEffect} from 'react';
import materialIcons from '../../../iconPicker/IconNamesList';

import {$createEmojiNode, EmojiNode} from './EmojiNode';
import { EMOJI_NODE_MARKDOWN_REGEX } from './EmojiNodeTransform';


function useEmojis(editor: LexicalEditor): void {
  useEffect(() => {
    if (!editor.hasNodes([EmojiNode, TextNode])) {
      throw new Error('EmojisPlugin: EmojiNode not registered on editor');
    }

    if (!materialIcons || !Array.isArray(materialIcons)) {
      return;
      // throw new Error('EmojisPlugin: materialIcons not properly loaded');
    }

    return editor.registerNodeTransform(TextNode, (textNode) => {
      if (EMOJI_NODE_MARKDOWN_REGEX.test(textNode.getTextContent()) || materialIcons.map((materialIcon : string) => ':' + materialIcon + ':').some((materialIcon : string) => textNode.getTextContent().includes(materialIcon))) {

        const materialIconToInsert = materialIcons.find((materialIcon : string) => textNode.getTextContent().replaceAll(':', '').includes(materialIcon));

        if (!materialIconToInsert) return;

        const initialTextInput = textNode.getTextContent();
        const emojiNode = $createEmojiNode(materialIconToInsert);

        const leftoverTextNodes : Array<TextNode> = [];

        initialTextInput?.split(':').forEach((leftoverTextString : string, index : number) => {
          if (materialIcons.includes(leftoverTextString)) {
            const emojiNode = $createEmojiNode(leftoverTextString);

            leftoverTextNodes.push(emojiNode);
            return;
          }
          leftoverTextNodes.push($createTextNode(leftoverTextString));
        });

        textNode.setTextContent('');


        textNode.getParent().splice(textNode.getIndexWithinParent(), 1, leftoverTextNodes);

        (leftoverTextNodes.find((node : TextNode) => materialIcons.includes(node.__text)) || leftoverTextNodes[leftoverTextNodes.length - 1]).select();

        textNode.remove();
      }
    });
  }, [editor]);
}

export default function EmojisPlugin(): React.ReactElement | null {
  const [editor] = useLexicalComposerContext();
  useEmojis(editor);
  return null;
}
