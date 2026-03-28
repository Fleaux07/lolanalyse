require('dotenv').config();
const express = require('express');
const axios = require('axios');


const app = express();
const PORT = 3000;


const API_KEY = process.env.RIOT_API_KEY;


app.get('/player/:gameName/:tagLine', async (req, res) => {
    try {

        const gameName = req.params.gameName;
        const tagLine = req.params.tagLine;


        const riotUrl = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${API_KEY}`;
        const response = await axios.get(riotUrl);
        const puuid = response.data.puuid


        const matchUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=5&api_key=${API_KEY}`;
        const matchresponse = await axios.get(matchUrl);
        
        const matchlist = matchresponse.data;


        res.json(matchlist);

    } catch (erreur) {
        console.error("❌ Erreur :", erreur.response ? erreur.response.data : erreur.message);
        res.status(500).json({ message: "Joueur introuvable ou erreur avec l'API" });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur démarré`);
});