import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';

import { loginValidations, registerValidations, scanValidations } from './validations/auth.js';

import checkAuth from './utils/checkAuth.js';
import checkPriority from './utils/checkPriority.js';

import * as GateRecordController from './controllers/GateRecordController.js';
import * as QRCodeController from './controllers/QRCodeController.js';
import * as UserController from './controllers/UserController.js';
import * as UploadController from './controllers/UploadController.js';

import handleValidationErrors from './utils/handleValidationErrors.js';

mongoose.connect('mongodb+srv://admin:Elsik2002@cluster0.8epg32u.mongodb.net/CheckInQR?retryWrites=true&w=majority').then(() => console.log("Database OK!")).catch((err) => console.error("DB ERROR:", err));

const app = express();
const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads');
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

app.use(express.json());
app.use("/uploads", express.static('uploads'));

app.post('/login', loginValidations, handleValidationErrors, UserController.login);
app.post('/create-account', checkAuth, checkPriority, registerValidations, handleValidationErrors, UserController.createAccount);
app.get('/authMe', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), UploadController.uploadFile);

app.get('/accounts', checkAuth, checkPriority, UserController.getAll);
app.get('/accounts/:id', checkAuth, checkPriority, UserController.getOne);
app.delete('/accounts/:id', checkAuth, checkPriority, UserController.remove);
app.patch('/accounts/:id', checkAuth, checkPriority, UserController.update);

app.get('/latest-qrcode', QRCodeController.getQR);
app.post('/scan', checkAuth, handleValidationErrors, scanValidations, GateRecordController.scanQR);

app.listen(4444, (err) => {
    if (err) {
        return console.error("Server ERROR:", err);
    }

    console.log("Server OK!");
});