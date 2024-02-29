// eslint-disable-next-line import/prefer-default-export
export const copyToClipboard = async (text: string) => {
  if ('clipboard' in navigator) {
    await navigator.clipboard.writeText(text);
  } else {
    document.execCommand('copy', true, text);
  }
};
