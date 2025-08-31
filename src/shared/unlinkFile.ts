import fs from 'fs';
import path from 'path';

const unlinkFile = (file: string) => {
  // strip any leading slashes so path.join keeps uploads as base
  const safe = file.replace(/^[/\\]+/, '');
  const filePath = path.join(process.cwd(), 'uploads', safe);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export default unlinkFile;
