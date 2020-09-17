var spotifyApi = new SpotifyWebApi(); 

let app = new Vue({
  el: "#app",
  data() {
    return {
      client_id: '07f7df2afa354e62ade6112cff6fee3a',
      scopes: 'user-top-read streaming user-read-private',
      redirect_uri: 'http://localhost:8000/',
      currentSongCover: null,
      token: null,
      me: null
    }
  },
  methods: {
    async login() {
      let popup = window.open(`https://accounts.spotify.com/authorize?client_id=${this.client_id}&response_type=token&redirect_uri=${this.redirect_uri}&scope=${this.scopes}&show_dialog=true`, 'Login with Spotify', 'width=800,height=600');
        
      window.spotifyCallback = async (payload) => {
        popup.close();
          
        await fetch('https://api.spotify.com/v1/me', {
          headers: {
            'Authorization': `Bearer ${payload}`
          }
        }).then(response => {
          return response.json()
        }).then(data => {
              
          this.token = payload;
          this.me = data;
          this.loadSpotifyPlayer(this.token);
        });
          
        console.log("Access Token: " + this.token)
        spotifyApi.setAccessToken(this.token);  

        let data = await spotifyApi.getMyTopTracks();
            
        console.log(data)
      }
    },

    play() {
       spotifyApi.play();
    },
     
    pause(){
      spotifyApi.pause();
    },

    nextSong(){
      spotifyApi.skipToNext();
    },  

    previousSong(){
      spotifyApi.skipToPrevious();
    },

    updateSong(data){
      this.currentSongCover = data.album.images[0].url;
      //console.log("Album Cover: " + this.currentSongCover);
    },




    loadSpotifyPlayer(token){
      const player = new Spotify.Player({
        name: 'Musik Tinder',
        getOAuthToken: cb => { cb(token); }
      });

      // Error handling
      player.addListener('initialization_error', ({ message }) => { console.error(message); });
      player.addListener('authentication_error', ({ message }) => { console.error(message); });
      player.addListener('account_error', ({ message }) => { console.error(message); });
      player.addListener('playback_error', ({ message }) => { console.error(message); });

      // Playback status updates
      player.addListener('player_state_changed', state => { 
        console.log(state); 
        this.updateSong(state.track_window.current_track);
      });

      // Ready
      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
      });

      // Not Ready
      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      // Connect to the player!
      player.connect();
    },


    },
    mounted() {
      this.token = window.location.hash.substr(1).split('&')[0].split("=")[1]; //Access token
      
      if (this.token) {
        // alert(this.token)
        
        window.opener.spotifyCallback(this.token);

      }
    },
});






window.onSpotifyWebPlaybackSDKReady = () => {}; //This must be defined lol