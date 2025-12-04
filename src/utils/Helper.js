const parseJSON = (data) => {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

// inject uploaded file paths inside JSON fields
const applyImagesToJSON = (jsonData, uploadedFiles, prefix) => {
  const arr = parseJSON(jsonData);

  if (!Array.isArray(arr)) return arr;

  return arr.map((item, index) => {
    for (let key in item) {
      const field = `${prefix}[${index}][${key}]`;
      if (uploadedFiles[field]) {
        item[key] = uploadedFiles[field];  // replace with uploaded file path
      }
    }
    return item;
  });
};
