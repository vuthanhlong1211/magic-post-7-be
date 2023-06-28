import express from "express";
import { Router } from "express";
const app = require('express')();
const path = require('path');

const router = Router();

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'login.html'));
});

export default router;