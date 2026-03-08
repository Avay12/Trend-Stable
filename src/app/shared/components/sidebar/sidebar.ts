import { Component, inject, afterNextRender, AfterViewInit, NgZone, Renderer2 } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { AuthService } from '../../../core/services/auth.service';

import { CartService } from '../../../core/services/cart.service';
import { CommonModule } from '@angular/common';
import { CurrencyService } from '../../../core/services/currency.service';
import { MusicService } from '../../../core/services/musics.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements AfterViewInit {
  authService = inject(AuthService);
  cartService = inject(CartService);
  currencyService = inject(CurrencyService);
  musicService = inject(MusicService);
  
  private router = inject(Router);
  sidebarService = inject(SidebarService);
  private ngZone = inject(NgZone);
  private renderer = inject(Renderer2);


  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout error:', error);
      },
    });
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  // Music Player Logic
  isPlaying = false;
  isAutoPlayEnabled = true; // Default to false
  currentTrackIndex = 0;
  player: any;
  ytApiLoaded = false;
  
  tracks: any[] = []; 

  constructor() {
    this.router.events.subscribe(() => {
      this.sidebarService.close();
    });

    // Load Autoplay Preference
    const savedAutoPlay = localStorage.getItem('isAutoPlayEnabled');
    // Default to true if not set, otherwise respect the saved value
    this.isAutoPlayEnabled = savedAutoPlay !== 'false';

    // Default Fallback Playlist (R&B & Popular Hits)
    this.tracks = [
       {
        title: 'Birds of Feather',
        artist: 'Billie Eilish',
        cover: 'https://i.scdn.co/image/ab67616d00001e0271d62ea7ea8a5be92d3c1f62',
        id: 'd5gf9dXbPi0',
        duration: '3:31'
      },
       {
        title: 'One Of The Girls ',
        artist: 'The Weeknd',
        cover: 'https://i.scdn.co/image/ab67616d00001e02b0dd6a5cd1dec96c4119c262',
        id: 'f1r0XZLNlGQ',
        duration: '4:04'
      },
       {
        title: 'Snooze',
        artist: 'SZA',
        cover: 'https://i.scdn.co/image/ab67616d0000b27370dbc9f47669d120ad874ec1',
        id: 'Sv5yCzPCkv8',
        duration: '3:21'
      },
       {
        title: 'Jimmy Cooks',
        artist: 'Drake ft 21 Savage',
        cover: 'https://i.scdn.co/image/ab67616d00001e028dc0d801766a5aa6a33cbe37',
        id: 'V7UgPHjN9qE',
        duration: '3:38'
      },
       {
        title: 'Not Like Us',
        artist: 'Kendrick Lamar',
        cover: 'https://i.scdn.co/image/ab67616d00001e021ea0c62b2339cbf493a999ad',
        id:'T6eK-2OQtew',
        duration: '4:43'
      },
      {
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        cover: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
        id: '4NRXx6U8ABQ',
        duration: '3:20'
      },
      {
        title: 'Die For You',
        artist: 'The Weeknd',
        cover: 'https://i.scdn.co/image/ab67616d0000b273a048415db52aeb5c23e8784d',
        id: 'QLCpqdqeoII',
        duration: '4:20'
      },
      {
        title: 'Kill Bill',
        artist: 'SZA',
        cover: 'https://i.scdn.co/image/ab67616d0000b27370dbc9f47669d120ad874ec1',
        id: 'MSRcC626prw',
        duration: '2:33'
      },
      {
        title: 'Starboy',
        artist: 'The Weeknd ft. Daft Punk',
        cover: 'https://i.scdn.co/image/ab67616d0000b2734718e28c2291f5382588b649',
        id: '34Na4j8AVgA',
        duration: '3:50'
      },
      {
        title: 'Sure Thing',
        artist: 'Miguel',
        cover: 'https://i.scdn.co/image/ab67616d0000b273a0d172087d19da6aa4ce2585',
        id: 'q4GJVOMjCC4',
        duration: '3:14'
      }
    ];

    // Load Music from YouTube API
    this.musicService.getLatestRnB().subscribe({
      next: (response: any) => {
        if (response.items && response.items.length > 0) {
          const apiTracks = response.items.map((item: any) => ({
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            cover: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
            id: item.id.videoId, // Use videoId for playback
            duration: '0:00'
          }));
          
          // Combine or replace? Let's use API tracks if available, but keep fallback if needed.
          // For now, replacing is standard behavior if API works.
          this.tracks = apiTracks;
          
          this.currentTrackIndex = Math.floor(Math.random() * this.tracks.length);
          // If player is ready, load the new track
          if(this.player && this.player.loadVideoById) {
             if (this.isAutoPlayEnabled) {
               this.loadTrack();
             } else {
               // Just cue the video without playing if autoplay is off
               this.player.cueVideoById(this.currentTrack.id);
             }
          }
        }
      },
      error: (err) => {
          console.error('Failed to load music from API, using fallback playlist', err);
          // Fallback tracks are already set in constructor, so we just stick with them.
      }
    });
  }

  ngAfterViewInit() {
    this.loadYoutubeApi();
  }

  loadYoutubeApi() {
    if (!(window as any)['YT']) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      (window as any)['onYouTubeIframeAPIReady'] = () => {
        this.ytApiLoaded = true;
        this.createPlayer();
      };
    } else {
      this.ytApiLoaded = true;
      this.createPlayer();
    }
  }

  createPlayer() {
      // Create a hidden div for the player
      // We need a slight delay to ensure the div exists in DOM if we were doing this in ngOnInit
      // Since this is sidebar, it should be there. 
      // We will look for an element with id 'youtube-player'
      this.player = new (window as any)['YT'].Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: this.tracks[0]?.id,
        playerVars: {
          'playsinline': 1,
          'controls': 0
        },
        events: {
          'onReady': (event: any) => {
            this.ngZone.run(() => {
             if (this.isAutoPlayEnabled) {
               this.loadTrack();
             } else {
               this.player.cueVideoById(this.currentTrack.id);
             }
            });
          },
          'onStateChange': (event: any) => {
             this.ngZone.run(() => {
                // YT.PlayerState.PLAYING = 1
                if (event.data === 1) {
                    this.isPlaying = true;
                } 
                // YT.PlayerState.PAUSED = 2, ENDED = 0
                else if (event.data === 2 || event.data === 0) {
                    this.isPlaying = false;
                }

                if (event.data === 0) {
                    this.nextTrack();
                }
             });
          },
          'onError': (event: any) => {
            console.error('YouTube Player Error:', event.data);
            // Error codes: 100, 101, 150 mean video unavailable/restricted.
            // Move to next track automatically
            this.ngZone.run(() => {
                this.nextTrack();
            });
          }
        }
      });
  }


  get currentTrack() {
    return this.tracks[this.currentTrackIndex];
  }

  togglePlay() {
    if (!this.player || !this.player.getPlayerState) return;

    // YT.PlayerState.PLAYING = 1
    if (this.player.getPlayerState() === 1) {
      this.player.pauseVideo();
    } else {
      if (this.player.isMuted()) {
        this.player.unMute();
      }
      this.player.playVideo();
    }
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    this.loadTrack();
  }

  toggleAutoPlay() {
    this.isAutoPlayEnabled = !this.isAutoPlayEnabled;
    localStorage.setItem('isAutoPlayEnabled', String(this.isAutoPlayEnabled));
  }

  prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    this.loadTrack();
  }

  private loadTrack() {
    if (!this.player || !this.player.loadVideoById) return;
    
    this.player.loadVideoById(this.currentTrack.id);
  }

  closeSidebar() {
    this.sidebarService.close();
  }
}
