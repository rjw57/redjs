import * as React from 'react';

import screenFontUrl from './PxPlus (TrueType - extended charset)/PxPlus_IBM_VGA9.ttf';

export interface FontSpec {
  font: string;
  glyphWidth: number;
  glyphHeight: number;
}

export const useScreenFont = () => {
  const [fontSpec, setFontSpec] = React.useState<FontSpec>({
    font: '16px monospace', glyphWidth: 8, glyphHeight: 16,
  });

  React.useEffect(() => {
    new FontFace('Screen', `url(${screenFontUrl})`).load().then(fontFace => {
      document.fonts.add(fontFace);
      setFontSpec({font: `16px "${fontFace.family}"`, glyphWidth: 9, glyphHeight: 16});
    });
  }, [setFontSpec]);

  return fontSpec;
};
