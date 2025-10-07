import { BehaviorSubject, catchError, filter, fromEvent, of, switchMap, throttleTime } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import './style.css'

const loader = document.querySelector("#loader") as HTMLElement;
interface Personaje{
  id: number;
  name: string;
  ki: string;
  maxKi: string;
  image: string;
}
const paginaActual = new BehaviorSubject(1);
var listPesonajes: Personaje[] = [];

function pintarPersonajes(personajes: Personaje[]){
const app = document.querySelector<HTMLDivElement>("#app")!;
 app.innerHTML += renderPersonajes(personajes);
}

function renderPersonajes(personajes: Personaje[]){
  return personajes.map(data=>
    `<div class="personaje-card">
      <div class="img-container">
        <img src="${data.image}" alt="${data.name}">
      </div>
      <h3>${data.name}</h3>
      <div class="ki-container">
        <div class="ki-bar" style="width:${data.maxKi}%"></div>
      </div>
      <div class="ki-text">Ki: ${data.ki} / ${data.maxKi}</div>
    </div>
  `
  ).join('');
}

paginaActual.subscribe({
  next: (value) => {
    if(value >= 6){
      loader.classList.add("hidden");
    }else{
    loader.classList.remove("hidden");
    }
    fromFetch('https://dragonball-api.com/api/characters?page=' + value).pipe(
      switchMap(response =>{
        if(response.ok){
          return response.json();
        }else{
          loader.textContent = "Error al cargar los personajes";
          throw new Error('Error en la llamada a la API');
        }
      }),
      catchError(err=>{
        return of([{Error: true, message: err.message}]);
      })).subscribe(data=>{
        if("Error"in data){
          console.error(data.Error);
        }else{
          data.items.forEach((p: Personaje) => listPesonajes.push(p));
          pintarPersonajes(data.items.map((p: Personaje) => ({
            id: p.id,
            name: p.name,
            ki: p.ki,
            maxKi: p.maxKi,
            image: p.image
          })));
        }
      });
  }
});
function buscarNombre(nombre: string){
  listPesonajes.forEach(p => {
    if(p.name.toLowerCase().includes(nombre.toLowerCase())){

    }
  })
}

fromEvent(window,"scroll").pipe(
  throttleTime(500),
    filter(() =>(window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200)
).subscribe(() => {
paginaActual.next(paginaActual.value + 1);
})

