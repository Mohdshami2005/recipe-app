const recipeContainer=document.querySelector("#recipeContainer");
const searchBtn=document.querySelector("#searchBtn");
const recipeSearch=document.querySelector("#recipeSearch");
const recipeForm=document.querySelector("#recipeForm");
recipeForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    let recipe_entered=recipeSearch.value;
    recipe_entered=recipe_entered.trim(); // to remove the white spaces if entere by the user.
    display_recipe(recipe_entered);
})
async function display_recipe(recipe_entered){
    try{
        recipeContainer.innerHTML=`<h1>Fetching recipes...</h1>`; // so that while fetch() works we can see it.
        if(recipe_entered===``){ // as user might just enter white spaces or nothing.
            throw new Error("Enter the Meal to get Recipe..");
        }
        let response=await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${recipe_entered}`); // to get response of api.
        if(response.ok==false){
            if(response.status==404){
                throw new Error("Meal not Found!");
            }
            else{
                throw new Error("Something went Wrong!");
            }
        }
        let data=await response.json(); // to convert response into data.
        // so in data we got a object which only has 1 key "meal" whose value is an array of dishes related to the searched recipe.
        if(data["meals"]==null){ // as key "meal" do not contain any array because means no recipe found for the meal
            throw new Error("No Recipe Found..");
        }
        // so we got an object in data conatining a key "meals" , which have an array of dishes.
        recipeContainer.innerHTML=""; // so that the previously searched dishes and images present can be removed.
        let arr=data["meals"];
        for(let i=0;i<arr.length;i++){
            // so each element in array contains info of a dish (the dish is related to the meal we just searched).
            let obj=arr[i]; // as each element of the array is an object storing info, img , ingredients, proper name,etc of the dish.
            let dish_div=document.createElement("div");
            dish_div.className="dish_divs";
            // now lets gather the info required of the dish that we will display.
            let img_link=obj["strMealThumb"]; // as obj contains a key "strMealThumb" storing the dish's image source.
            let dish_name=obj["strMeal"]; // to get the full actual name of the meal.
            let dish_area=obj["strArea"]; // to get the area of the dish where it is made like italian,japanese,etc.
            // but some recipes are there where area is not specified.
            if(!dish_area){ // i.e if it is null
               dish_area="Unknown";
            }
            let dish_category=obj["strCategory"]; // to get the categoty of the dish like vegetarian,chicken,lamb etc.
            
            
            dish_div.innerHTML=`
                <img src="${img_link}" class="dish_images">
                <h1>${dish_name}</h1>
                <h2>${dish_category}</h2>
                <h2>${dish_area}</h2>
            `;
            
            // now we also need a button clicking on which we will get the dish's ingrediants and instructions.
            // so we will create it separatly as wealso need to add an event llistener to it.
            let but=document.createElement("button");
            but.id="recipeBtn"; // so that we can do styling in css file.
            but.innerHTML=`<h1>View Recipe</h1>`;
            dish_div.append(but);
            recipeContainer.append(dish_div);
            // now lets add event listener on the recipeBtn to open a pop up containing details of the the recipe.
            
            but.addEventListener("click",(e)=>{
                /*We use e.stopPropagation() because the button is inside dish_div.
                We have also added a click event listener to dish_div (to open the
                YouTube recipe video).
        
                Normally, when we click the button, the click event first occurs on
                the button and then "bubbles up" to its parent element (dish_div).
        
                As a result:
                1. The popup would open (button's event).
                2. The YouTube video would also open (dish_div's event).
        
                We don't want both actions to happen together.
        
                e.stopPropagation() stops the event from bubbling to the parent,
                so only the button's click event runs.
                */            
                e.stopPropagation();
                openPopup(obj); // as this object contains the info related to the recipe , also note we can't write this Event listener outside the vblock as button ony exist when dish_div is there.
            });
            dish_div.addEventListener("click",()=>{
                // so if any recipes dish_div is clicked we want to play the youtube vedio of this recipe in another tab.
                // so making dish_div a link is too frustrating so we will use window.open(url,type).
                // window.open(url, target);
                // url → The webpage to open.
                // target:
                // "_blank" → Opens in a new tab.
                // "_self" → Opens in the same tab.
               
                let link=obj["strYoutube"];
                if(link){
                    window.open(obj["strYoutube"], "_blank");
                }
                else{ // i.e if link is not given
                    alert("No video available for this recipe.");
                }
            });
        }
        
    }
    catch(err){
        recipeContainer.innerHTML=`<h1>${err.message}</h1>`
    }
}
let recipePopup=document.querySelector("#recipePopup");
function openPopup(obj){
    // so we will display ingredients along with their quantity and name and at last we will display the process to make this dish i.e the instructions.
    // so fisrtly make the recipePopup visible ->
    recipePopup.style.display="block";
    
    // how to add ingredients --> as we can see the obj for any recipe we searched we always has 20 ingridient keys storing name of the ingredients and 20 ingredientMeausers each storing the quantity of the ingredient required
    // in a reciepe there might be less than 20 ingredients required so all the rmaining ingredient keys will store "" i.e empty string as value so we will iterate only untill we get .
    recipePopup.innerHTML=`
        <button id="recipeCloseBtn"><i class="fa-solid fa-xmark"></i></button>
        <h1>${obj["strMeal"]}</h1>
        <h2>Ingredients:</h2>
        <ul>${fetchIngredients(obj)}</ul>
        <h2>Instructions:</h2>
        <p>${obj["strInstructions"]}</p>
    `; // fetch ingredients will give us ingredients name along with its quantity in an <li> tag.
    document.querySelector("#recipeCloseBtn").addEventListener("click",()=>{
    recipePopup.style.display="none"; // we cannot write it outside this block as recipeCloseBtn only exist when popup is there.
    })
    
}
function fetchIngredients(obj){
    let str=""; // will store all the ingredients and their quantity in <li> tags.
    for(let i=1;i<=20;i++){
        let ingredient=obj[`strIngredient${i}`]; // so like strIngredient1,strIngredient2... , sio it will give name of the ith ingredient.
        let ingredient_quantity=obj[`strMeasure${i}`];// so it will give quantity required of the ith ingredient.
        if(!ingredient || ingredient.trim() === ""){
            break; // as there were less than 20 ingredients, so that's why empty string or null or spaces ,started to appear in place of ingredient names.
        }
        let ele=`<li>${ingredient_quantity} ${ingredient}</li>`;
        str+=ele;
    }
    return str;
}