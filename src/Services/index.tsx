import axios from 'axios';
import { useState } from 'react';
import photos from '../assets/Photos/photos.json'

export async function getCharacters(pagNumber : number, setCharactersList: React.Dispatch<React.SetStateAction<any>>) {

    const options: any = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }


    axios.get(`https://swapi.dev/api/people/?page=${pagNumber}`)
    .then(async (response) => {

        let processedItems = 0;

        // pega item por item
        response.data.results.forEach(async (character:any, index: number, array: any) => {
            // console.log(character)

            // Despacha o homeworld do personagem
            const homeworldResponse = await axios.get(character.homeworld);
            character.homeworld = homeworldResponse.data.name;

            //Recupera os filmes de todos os personagens
            const filmsPromises = character.films.map((film: any) => axios.get(film));
            //Despacha todos os filmes
            const filmsResponses = await Promise.all(filmsPromises);
            character.films = filmsResponses.map((response) => response.data.title);

            const speciesPromises = character.species.map((film: any) => axios.get(film));
            let speciesResponses:any = await Promise.all(speciesPromises);

            //a espécie human não está presente na API, fiz essa verificação para adiciona-lá e poder tratar com filtros.
            if (speciesResponses.length > 0)
            {
                character.species = speciesResponses.map((response:any) => response.data.name);    
            }
            else
            {
                character.species = ['Human']
            }

            let characterImage = photos.find((item:any) => item.name === character.name)

            character.image = characterImage?.image

            processedItems += 1;

            if (processedItems === array.length)
            {
                setCharactersList(response.data.results)
            }

        });
    });
}

export async function getTotalPages(setTotalPages: React.Dispatch<React.SetStateAction<any>>, totalPages : number)
{
    let nextPage:any = 'https://swapi.dev/api/people/';

    let pages:any = 0;

    while (nextPage) {
        const res = await fetch(nextPage)

        const { next, results } = await res.json()
        
        pages += 1;

        nextPage = next
    }


    setTotalPages(totalPages + pages);

}



// async function fetchCharactersSubCategories(character: any, category: string, setCharactersList:any)
// {

//     const filmsPromises = character[category].map((film: any) => axios.get(film));
//     const filmsResponses = await Promise.all(filmsPromises);
//     character.films = filmsResponses.map((response) => response.data.title);
 
// }
