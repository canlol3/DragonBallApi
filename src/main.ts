import { BehaviorSubject, catchError, of, switchMap } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import './style.css'

const btnsContainer = document.querySelector(".btns") as HTMLElement

interface Personaje{
  id: number;
  name: string;
  ki: string;
  maxKi: string;
  image: string;
}
const paginaActual = new BehaviorSubject(1);



function pintarPersonajes(personajes: Personaje[]){
const app = document.querySelector<HTMLDivElement>("#app")!;
 app.innerHTML = personajes.map(data => `
    <div class="personaje-card">
      <div class="img-container">
        <img src="${data.image}" alt="${data.name}">
      </div>
      <h3>${data.name}</h3>
      <div class="ki-container">
        <div class="ki-bar" style="width:${data.maxKi}%"></div>
      </div>
      <div class="ki-text">Ki: ${data.ki} / ${data.maxKi}</div>
    </div>
  `).join('');
}

btnsContainer.addEventListener("click",(event)=>{
  const target = event.target as HTMLElement
  if(target.classList.contains("btn")){
   paginaActual.next(parseInt(target.textContent!))
  }
})

paginaActual.subscribe({
  next: (value) => fromFetch('https://dragonball-api.com/api/characters?page=' + value+"&limit=8").pipe(
    switchMap(response =>{
      if(response.ok){
        return response.json();
      }else{
        throw new Error('Error en la llamada a la API');
      }
    }),
    catchError(err=>{
      return of([{Error: true, message: err.message}]);
    })).subscribe(data=>{
      if("Error"in data){
        console.error(data.Error);
      }else{
        pintarPersonajes(data.items.map((p:Personaje) => ({
          id: p.id,
          name: p.name,
          ki: p.ki,
          maxKi: p.maxKi,
          image: p.image
        })));
      }
    })
})