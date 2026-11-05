import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

import numpy as np
import mne
from ieeg_stim.preprocessing import apply_filters
from ieeg_stim.stimulation import epoch_50hz_train, detect_afterdischarges

def test_pipeline():
    # 1. Create dummy data
    sfreq = 1000
    info = mne.create_info(ch_names=['STIM', 'EEG1', 'EEG2'], sfreq=sfreq, ch_types=['stim', 'eeg', 'eeg'])
    
    # 60 seconds of random noise
    data = np.random.randn(3, 60 * sfreq)
    
    # Add a stim event at 10 seconds
    data[0, 10 * sfreq] = 1.0
    
    # Add an "afterdischarge" (high amplitude sine wave) to EEG1 from 15 to 25 seconds
    t = np.arange(10 * sfreq) / sfreq
    data[1, 15 * sfreq:25 * sfreq] += 10 * np.sin(2 * np.pi * 5 * t)
    
    raw = mne.io.RawArray(data, info)
    
    # 2. Extract events
    events = mne.find_events(raw, stim_channel='STIM', min_duration=0.001)
    print("Found events:", events)
    
    # 3. Epoching
    epochs = epoch_50hz_train(raw, events, tmin=-2.0, tmax=20.0, stim_duration=5.0)
    print("Epochs created:", epochs)
    
    # 4. AD Detection
    ad_channels = detect_afterdischarges(epochs, post_stim_window=(5.0, 15.0))
    print("AD channels detected:", ad_channels)
    
    # Assertions
    assert ad_channels[0, 0] == True, "Should detect AD on EEG1"
    assert ad_channels[0, 1] == False, "Should not detect AD on EEG2"
    
    print("Test passed successfully!")

if __name__ == '__main__':
    test_pipeline()
