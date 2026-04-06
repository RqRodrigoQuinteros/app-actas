const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID || 'app-actas',
    private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    token_uri: 'https://oauth2.googleapis.com/token',
  },
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const driveService = google.drive({ version: 'v3', auth });

async function ensureFolderExists(parentId, folderName) {
  const response = await driveService.files.list({
    q: `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder'`,
    fields: 'files(id, name)',
  });

  if (response.data.files.length > 0) {
    return response.data.files[0].id;
  }

  const folder = await driveService.files.create({
    resource: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  });

  return folder.data.id;
}

async function uploadFile(fileBuffer, fileName, mimeType, folderId) {
  const { Readable } = require('stream');
  
  const stream = new Readable();
  stream.push(fileBuffer);
  stream.push(null);

  const response = await driveService.files.create({
    resource: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id, webViewLink',
  });

  return {
    fileId: response.data.id,
    webViewLink: response.data.webViewLink,
  };
}

async function getInspectorFolder(inspectorNombre) {
  const rootFolderId = process.env.DRIVE_ROOT_FOLDER_ID;
  const inspeccionesFolderId = await ensureFolderExists(rootFolderId, 'Inspecciones');
  const inspectorFolderId = await ensureFolderExists(inspeccionesFolderId, inspectorNombre.toUpperCase());
  return inspectorFolderId;
}

async function getInformesFolder() {
  const rootFolderId = process.env.DRIVE_ROOT_FOLDER_ID;
  return await ensureFolderExists(rootFolderId, 'Informes Arquitectura');
}

module.exports = {
  uploadFile,
  ensureFolderExists,
  getInspectorFolder,
  getInformesFolder,
};
