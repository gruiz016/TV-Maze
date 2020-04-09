//This function searches tvmaze api and sends the search term
async function searchShows(query) {
  const response = await axios.get(" http://api.tvmaze.com/search/shows", {
    params: { q: query },
  });

  //We return a array with all the tv shows that meet the search term.
  let showArr = [];

  //We loop through the response and push each object into an array so we can loop through later.
  for (let data of response.data) {
    showArr.push(data.show);
  }
  return showArr;
}

//This function targets the area where the search results will be appended to the DOM.
function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  //We loop through the passed array of objects from the results of the searchShows().
  for (let show of shows) {
    //For each object we build a container to hold the show data and display it on the DOM.
    //Below the container is the bootstrap model that opens when a user wants to see the episode list.
    let $item = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="col col-sm-12 card m-2" data-show-id="${show.id}">
           <div class="card-body">
           <img class="img-fluid mb-4 card-img-top" src="${show.image.medium}" alt="${show.name}">
             <h5 class="card-title text-center">${show.name}</h5>
             <p class="card-text text-center">${show.summary}</p>
             <button type="button" class="btn btn-warning btn-block" id="episode" data-toggle="modal" data-target="#episode-list">Episode List</button>
           </div>
         </div>
       </div>
       <div class="modal fade" id="episode-list" tabindex="-1" role="dialog" aria-labelledby="episode-list" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-center" id="episode-list">Episode List</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary clear" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
      `
    );
    //Once each result was built and modal has been attached we append all the result cards to the DOM.
    $showsList.append($item);
  }
}

//This function gets the episodes for a paticular show
async function getEpisodes(id) {
  //checks to see if we get an id if not we do not excute anything.
  if (!id) return;
  const response = await axios.get(
    `http://api.tvmaze.com/shows/${id}/episodes`
  );
  //returns the episode(s) object(s).
  return response.data;
}

//This function appends to the modal body we built with each show result.
const populateEpisodes = (episodes) => {
  //if no episodes are passed, then we do not excute anything
  if (!episodes) return;
  //selects the modal body
  const $modal = $(".modal-body");
  //loops through all the episode data and appends it to the modal body
  for (let episode of episodes) {
    $episodeData = $(`<ul>
    <li>${episode.name} (season: ${episode.season}, episode: ${episode.number})</li>
  </ul>`);
    $modal.append($episodeData);
  }
};

//listens for the form submition.
$("#search-form").on("submit", async function handleSearch(evt) {
  //prevents default form submittions.
  evt.preventDefault();
  //collects the value from the input and stores it so we can pass it along.
  let query = $("#search-query").val();
  //if nothing, or blank string is passed we do not excute anything.
  if (!query) return;
  //stores the response from the searchShows() to pass to popluate shows.
  let shows = await searchShows(query);
  populateShows(shows);
  //Resets the input value.
  $("#search-query").val("");
});
//handles the episode list, click.
$("#shows-list").on("click", async function handleEpisode(evt) {
  //stores the id from the target that trigged the event.
  //* only part of the solution i needed */
  let id = $(evt.target).closest(".Show").data("show-id");
  //stores the result of calling getEpisodes().
  let episode = await getEpisodes(id);
  populateEpisodes(episode);
});
//This listens for the modal close, either clicking close or clicking the background
$("#shows-list").on("click", () => {
  //selects the modal body
  const $modal = $(".modal-body");
  //clears the modal body so we don't continue adding episode data onto the modal.
  $modal.html("");
});
