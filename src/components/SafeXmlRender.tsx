import React from 'react';
import sanitizeHtml from 'sanitize-html';

interface SafeXmlRenderProps {
  xmlString: string;
}

const allowedTags = [
  'b', 'i', 'em', 'strong', 'u', 'ul', 'ol', 'li', 'p', 'div', 'span', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
];
const allowedAttributes = {
  'div': ['class'],
  'span': ['class'],
};

function convertXmlToHtml(xml: string): string {
  return xml
    .replace(/<short_vowels>/g, '<div class="short-vowels">')
    .replace(/<\/short_vowels>/g, '</div>')
    .replace(/<long_vowels>/g, '<div class="long-vowels">')
    .replace(/<\/long_vowels>/g, '</div>')
    .replace(/<vowel>/g, '<span class="vowel">')
    .replace(/<\/vowel>/g, '</span>')
    .replace(/<explanation>/g, '<p class="explanation">')
    .replace(/<\/explanation>/g, '</p>');
}

const SafeXmlRender: React.FC<SafeXmlRenderProps> = ({ xmlString }) => {
  const htmlString = convertXmlToHtml(xmlString);
  const cleanHtml = sanitizeHtml(htmlString, {
    allowedTags,
    allowedAttributes,
  });

  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
};

export default SafeXmlRender; 