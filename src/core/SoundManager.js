export class SoundManager {
    constructor() {
        this.sounds = {};
        this.volume = {
        master: 0.7,
        sfx: 0.8,
        music: 0.5
        };
        this.enabled = true;
    }

    /**
     * Load semua sound effects
     */
    loadSounds() {
        this.sounds = {
            // Zombie sounds
            zombieUtter: new Audio('assets/sounds/zombie-uttering.mp3'),
            
            // Player footsteps
            walkGrass1: new Audio('assets/sounds/walk-on-grass-1.mp3'),
            walkGrass3: new Audio('assets/sounds/walk-on-grass-3.mp3'),

            // Weapon SFX
            katanaNotHit: new Audio('assets/sounds/sword-sound-2.mp3'),
            katanaHit: new Audio('assets/sounds/sword-blade-slicing-flesh.mp3'),
            punchNotHit: new Audio('assets/sounds/whip01.mp3'),
            punchHit: new Audio('assets/sounds/punch-2.mp3'),
            fireball: new Audio('assets/sounds/fireball-whoosh-2.mp3'),
            gunShot: new Audio('assets/sounds/gunshot.mp3'),
            pistolGunShot: new Audio('assets/sounds/pistol-gun-shot.mp3'),
        };

        // Set default volume untuk semua sounds
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.volume.master * this.volume.sfx;
        });
    }

    /**
     * Play sound dengan opsi random pitch
     */
    play(soundName, options = {}) {
        if (!this.enabled) return;

        const sound = this.sounds[soundName];
        if (!sound) {
            console.warn(`Sound "${soundName}" not found`);
            return;
        }

        // Clone audio agar bisa play multiple instances
        const audio = sound.cloneNode();
        
        // Set volume (override jika ada)
        audio.volume = options.volume !== undefined ? options.volume * this.volume.master : this.volume.master * this.volume.sfx;

        // Random pitch untuk variasi (opsional)
        if (options.randomPitch) {
            audio.playbackRate = 0.9 + Math.random() * 0.2; // 0.9 - 1.1
        }

        // Loop (opsional)
        if (options.loop) {
            audio.loop = true;
        }

        audio.play().catch(err => {
            console.warn('Audio play failed:', err);
        });

        return audio;
    }

    /**
     * Stop sound
     */
    stop(audio) {
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }

    /**
     * Play zombie sound dengan random pitch
     */
    playZombieSound() {
        this.play('zombieUtter', { 
        volume: 0.3,
        randomPitch: true 
        });
    }

    /**
     * Play footstep sound
     */
    playFootstep() {
        const footsteps = ['walkGrass1', 'walkGrass3'];
        const random = footsteps[Math.floor(Math.random() * footsteps.length)];
        this.play(random, { 
            volume: 0.2,
            randomPitch: true 
        });
    }


    /**
     * Stop footstep loop saat player berhenti
     */
    stopFootstepLoop() {
        if (this.currentFootstep) {
            this.stop(this.currentFootstep);
            this.currentFootstep = null;
        }
    }

    // ============================================
    // WEAPON SOUND METHODS
    // ============================================

    /**
     * Play weapon attack sound
     * @param {string} weaponName - Nama weapon ("Katana", "Tangan Kosong", "Wizard Book", "Dual Gun")
     * @param {boolean} isHit - Apakah serangan mengenai target
     */

    playWeaponSound(weaponName, isHit = false) {
        switch (weaponName) {
            case "Katana":
                this.playKatanaSound(isHit);
                break;
            
            case "Tangan Kosong":
                this.playPunchSound(isHit);
                break;
            
            case "Wizard Book":
                this.playFireballSound();
                break;
            
            case "Dual Gun":
                this.playGunSound();
                break;
            
            default:
                console.warn(`Unknown weapon: ${weaponName}`);
        }
    }

    /**
     * KATANA - 2 suara (hit & miss)
     */
    playKatanaSound(isHit) {
        if (isHit) {
            // Suara slash yang mengenai flesh
            this.play('katanaHit', {
                volume: 0.4,
                randomPitch: true
            });
        } else {
            // Suara swing sword di udara
            this.play('katanaNotHit', {
                volume: 0.3,
                randomPitch: true
            });
        }
    }

    /**
     * TANGAN KOSONG / FIST - 2 suara (hit & miss)
     */
    playPunchSound(isHit) {
        if (isHit) {
            // Suara punch yang mengenai target
            this.play('punchHit', {
                volume: 0.35,
                randomPitch: true
            });
        } else {
            // Suara whoosh/whip saat miss
            this.play('punchNotHit', {
                volume: 0.25,
                randomPitch: true
            });
        }
    }

    /**
     * WIZARD BOOK - 1 suara (fireball)
     */
    playFireballSound() {
        this.play('fireball', {
            volume: 0.3,
            randomPitch: true // Variasi pitch untuk tidak monoton
        });
    }

    /**
     * DUAL GUN - 2 variasi suara (gunshot & pistol)
     * Bergantian random untuk variasi
     */
    playGunSound() {
        // 50% chance pilih gunshot atau pistolGunShot
        const gunSounds = ['gunShot', 'pistolGunShot'];
        const randomGun = gunSounds[Math.floor(Math.random() * gunSounds.length)];
        
        this.play(randomGun, {
            volume: 0.45,
            randomPitch: true // Random pitch untuk variasi lebih banyak
        });
    }

    /**
     * Set master volume (0.0 - 1.0)
     */
    setVolume(volume) {
        this.volume.master = Math.max(0, Math.min(1, volume));
    }

    /**
     * Mute/unmute semua sound
     */
    toggleMute() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}