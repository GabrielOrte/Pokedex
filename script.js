const pokemonName = document.querySelector('.pokemon_name');
const pokemonNumber = document.querySelector('.pokemon_number');
const pokemonImage = document.querySelector('.pokemon_image');
const pokemonStats = document.querySelector('.pokemon_stats'); 
const pokemonTypes = document.querySelector('.pokemon_types');
const pokemonAbilities = document.querySelector('.pokemon_abilities');
const pokemonMovesPhysical = document.querySelector('.pokemon_moves_physical');
const pokemonMovesSpecial = document.querySelector('.pokemon_moves_special');
const pokemonMovesStatus = document.querySelector('.pokemon_moves_status');
const pokemonWeaknesses = document.querySelector('.pokemon_weaknesses');
const pokemonResistances = document.querySelector('.pokemon_resistances');

const form = document.querySelector('.form');
const input = document.querySelector('.input_search');

const buttonPrev = document.querySelector('.btn-prev');
const buttonNext = document.querySelector('.btn-next');

let searchPokemon = 1;

const fetchPokemon = async (pokemon) => {

    const APIResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);

    if (APIResponse.status === 200) {
        const data = await APIResponse.json();
        return data;
    }
}

const fetchMovesByType = async (moves, type) => {
    const movePromises = moves.map(async moveInfo => {
        const moveResponse = await fetch(moveInfo.move.url);
        const moveData = await moveResponse.json();
        return moveData.damage_class.name === type 
            ? `<p><strong>${moveData.name}</strong></p>` 
            : '';
    });

    const moveList = await Promise.all(movePromises);
    return moveList.filter(move => move !== '').join('');
};


const fetchTypeDetails = async (types) => {
    const typeDataPromises = types.map(async typeInfo => {
        const typeResponse = await fetch(typeInfo.type.url);
        return typeResponse.json();
    });

    return Promise.all(typeDataPromises);
};

const renderPokemon = async (pokemon) => {

    pokemonName.innerHTML = 'Loading ...'
    pokemonStats.innerHTML = '';
    pokemonMovesPhysical.innerHTML = '';
    pokemonMovesSpecial.innerHTML = '';
    pokemonMovesStatus.innerHTML = '';
    pokemonWeaknesses.innerHTML = 'Carregando fraquezas...';
    pokemonResistances.innerHTML = 'Carregando resistências...';
    
    const data = await fetchPokemon(pokemon);
    if (data) {
        pokemonImage.style.display = 'block';
        pokemonName.innerHTML = data.name;
        pokemonNumber.innerHTML = data.id;
        const animatedSprite = data.sprites.versions['generation-v']['black-white'].animated.front_default;
        const defaultSprite = data.sprites.front_default;
        
        pokemonImage.src = animatedSprite || defaultSprite;
        input.value = '';
        searchPokemon = data.id;

        pokemonStats.innerHTML = data.stats.map(stat => `
            <p><strong>${stat.stat.name}:</strong> ${stat.base_stat}</p>
        `).join('');

        pokemonTypes.innerHTML = data.types.map(typeInfo => `
            <span class="type ${typeInfo.type.name}">${typeInfo.type.name}</span>
        `).join('');

        pokemonAbilities.innerHTML = data.abilities.map(ability => `
            <p>${ability.ability.name}</p>
        `).join('');

        pokemonMovesPhysical.innerHTML = await fetchMovesByType(data.moves, "physical");
        pokemonMovesSpecial.innerHTML = await fetchMovesByType(data.moves, "special");
        pokemonMovesStatus.innerHTML = await fetchMovesByType(data.moves, "status");
        const typeDataList = await fetchTypeDetails(data.types);
        const weaknesses = new Set();
        const resistances = new Set();

        typeDataList.forEach(typeData => {
            typeData.damage_relations.double_damage_from.forEach(type => weaknesses.add(type.name));
            typeData.damage_relations.half_damage_from.forEach(type => resistances.add(type.name));
            typeData.damage_relations.no_damage_from.forEach(type => resistances.add(type.name));
        });

        pokemonWeaknesses.innerHTML = [...weaknesses].length > 0
            ? [...weaknesses].map(type => `<p class="weakness ${type}">${type}</p>`).join('')
            : '<p>Sem fraquezas específicas</p>';

        pokemonResistances.innerHTML = [...resistances].length > 0
            ? [...resistances].map(type => `<p class="resistance ${type}">${type}</p>`).join('')
            : '<p>Sem resistências específicas</p>';
    }
    else {
        pokemonName.innerHTML = 'Not found :c';
        pokemonNumber.innerHTML = '';
        pokemonImage.style.display = 'none';
        pokemonStats.innerHTML = '';
        pokemonTypes.innerHTML = '';
        pokemonAbilities.innerHTML = '';
        pokemonGeneration.innerHTML = '';
    }
}

form.addEventListener('submit', (event) => {

    event.preventDefault();
    renderPokemon(input.value.toLowerCase());

});

buttonPrev.addEventListener('click', () => {

    searchPokemon -= 1
    renderPokemon(searchPokemon)
});

buttonNext.addEventListener('click', () => {

searchPokemon += 1
renderPokemon(searchPokemon)

});

renderPokemon(searchPokemon);
