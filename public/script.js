/* ============================================================
   NEXUS.GG — Script Principal (profil.html)
   ============================================================ */

const params = new URLSearchParams(window.location.search);
const pseudo = params.get('pseudo');
const tag    = params.get('tag');

// --- Affichage du nom du joueur ---
const nomEl = document.getElementById('nomJoueur');
const initEl = document.getElementById('avatarInitiale');

if (pseudo && tag) {
    nomEl.innerText = `${pseudo} #${tag}`;
    if (initEl) initEl.innerText = pseudo.charAt(0).toUpperCase();
    chargerStats(pseudo, tag);
} else {
    nomEl.innerText = 'Invocateur inconnu';
    document.getElementById('zoneResultats').innerHTML = etatHTML('Aucun joueur spécifié.', false);
}

// --- Chargement des stats ---
async function chargerStats(pseudo, tag) {
    const zone   = document.getElementById('zoneResultats');
    const status = document.getElementById('statusLive');

    zone.innerHTML = etatHTML('⏳ Synchronisation réseau...', false);

    try {
        const reponse = await fetch(`/player/${encodeURIComponent(pseudo)}/${encodeURIComponent(tag)}`);
        if (!reponse.ok) throw new Error("Joueur introuvable");

        const matchs = await reponse.json();

        // Mise à jour du statut
        if (status) {
            status.innerHTML = `<span class="dot dot--pulse"></span> En ligne`;
        }

        // Calcul des stats globales
        const total   = matchs.length;
        const wins    = matchs.filter(m => m.victoire).length;
        const winrate = total > 0 ? Math.round((wins / total) * 100) : 0;

        const totalKills   = matchs.reduce((s, m) => s + m.kills, 0);
        const totalMorts   = matchs.reduce((s, m) => s + m.morts, 0);
        const totalAssists = matchs.reduce((s, m) => s + m.assists, 0);
        const kdaMoyen = totalMorts > 0
            ? ((totalKills + totalAssists) / totalMorts).toFixed(2)
            : '∞';

        // Champion le plus joué
        const champCount = {};
        matchs.forEach(m => { champCount[m.champion] = (champCount[m.champion] || 0) + 1; });
        const bestChamp = Object.entries(champCount).sort((a,b) => b[1]-a[1])[0]?.[0] || '—';

        // Mise à jour des stats rapides
        const statsEl = document.getElementById('statsRapides');
        if (statsEl) {
            statsEl.style.display = 'grid';
            document.getElementById('statMatchs').innerText   = total;
            document.getElementById('statWR').innerText       = `${winrate}%`;
            document.getElementById('statKDA').innerText      = kdaMoyen;
            document.getElementById('statBestChamp').innerText = bestChamp;

            // Couleur winrate
            const wrEl = document.getElementById('statWR');
            if (winrate >= 55) wrEl.style.color = 'var(--green)';
            else if (winrate < 45) wrEl.style.color = 'var(--red)';
        }

        // Rendu des cartes
        zone.innerHTML = '';

        matchs.forEach((match, i) => {
            const carte = document.createElement('div');
            carte.className = `match-card ${match.victoire ? 'victoire' : 'defaite'}`;
            carte.style.animationDelay = `${i * 0.05}s`;

            carte.innerHTML = `
                <div class="match-col-left">
                    <div class="match-status">${match.victoire ? 'Victoire' : 'Défaite'}</div>
                    <div class="match-mode">${match.mode || 'Classée'}</div>
                </div>

                <div class="match-col-center">
                    <div class="match-champion">${match.champion}</div>
                </div>

                <div class="match-col-right">
                    <div class="match-kda">${match.kills} / ${match.morts} / ${match.assists}</div>
                    <div class="match-kda-label">K / D / A</div>
                </div>
            `;

            zone.appendChild(carte);
        });

    } catch (err) {
        if (status) status.innerHTML = `<span style="color:var(--red)">● Hors ligne</span>`;
        zone.innerHTML = etatHTML('❌ Signal Perdu — Joueur introuvable.', true);
    }
}

function etatHTML(message, isError) {
    return `<div class="etat-message ${isError ? 'erreur' : ''}">${message}</div>`;
}