declare module 'browser-image-compression' {
  const imageCompression: (file: File, options: any) => Promise<File>;
  export default imageCompression;
}
