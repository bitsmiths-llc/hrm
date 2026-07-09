'use client';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  Autoformat,
  Bold,
  ClassicEditor,
  Essentials,
  Heading,
  Italic,
  Link,
  List,
  Paragraph,
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
};

/** CKEditor 5, dynamically imported by `rich-text-editor.tsx` so it never
 *  runs during SSR (it touches the DOM at load time). Content is stored as
 *  HTML rather than a PDF so policy updates can carry a real changelog and
 *  render in-app instead of requiring a re-upload for every edit. */
export function RichTextEditorImpl({
  value,
  onChange,
  disabled,
}: RichTextEditorProps) {
  return (
    <div className='rich-text-editor rounded-md border border-input [&_.ck-editor__editable]:min-h-48 [&_.ck-editor__editable]:px-3 [&_.ck-toolbar]:rounded-t-md [&_.ck-toolbar]:border-0 [&_.ck-toolbar]:border-b [&_.ck-toolbar]:border-input'>
      <CKEditor
        editor={ClassicEditor}
        disabled={disabled}
        data={value}
        config={{
          licenseKey: 'GPL',
          plugins: [
            Essentials,
            Paragraph,
            Heading,
            Bold,
            Italic,
            Link,
            List,
            Autoformat,
          ],
          toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            '|',
            'bulletedList',
            'numberedList',
            '|',
            'undo',
            'redo',
          ],
        }}
        onChange={(_event, editor) => onChange(editor.getData())}
      />
    </div>
  );
}
