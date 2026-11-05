"""
Stimulation processing module for handling 1 Hz and 50 Hz stimulation trains.
"""
import mne
import numpy as np

def extract_stim_events(raw, stim_channel_name='STIM'):
    """
    Extract stimulation events from a designated trigger channel.
    """
    events = mne.find_events(raw, stim_channel=stim_channel_name, consecutive=False)
    return events

def epoch_1hz_train(raw, events, event_id=1, tmin=-5.0, tmax=35.0, baseline=(-5.0, -1.0)):
    """
    Epoch data for a 1 Hz, 30-second stimulation train.
    """
    # Assuming the first event of the train is marked or we take all events.
    # We might need to group events to find the start of a train.
    # Here, we assume the provided events array contains the start triggers for the 30s trains.
    
    epochs = mne.Epochs(raw, events, event_id=event_id, tmin=tmin, tmax=tmax, 
                        baseline=baseline, preload=True)
    return epochs

def epoch_50hz_train(raw, events, event_id=1, tmin=-10.0, tmax=30.0, 
                     blank_artifact=True, stim_duration=5.0):
    """
    Epoch data for a 50 Hz, 1-5 second stimulation train.
    Focuses on the immediate post-stimulation period to identify afterdischarges.
    """
    # Create epochs
    epochs = mne.Epochs(raw, events, event_id=event_id, tmin=tmin, tmax=tmax, 
                        baseline=(tmin, -1.0), preload=True)
                        
    if blank_artifact:
        # Blank out the amplifier saturation during the stimulation train itself
        # This replaces data from t=0 to t=stim_duration with zeros
        times = epochs.times
        stim_mask = (times >= 0) & (times <= stim_duration)
        epochs._data[:, :, stim_mask] = 0.0
        
    return epochs

def detect_afterdischarges(epochs, post_stim_window=(5.0, 15.0), threshold_factor=3.0):
    """
    A basic automated AD detector based on line-length thresholding post-stim.
    """
    # Calculate baseline line-length
    baseline_window = (epochs.times >= epochs.baseline[0]) & (epochs.times <= epochs.baseline[1])
    baseline_data = epochs.get_data()[:, :, baseline_window]
    baseline_ll = np.sum(np.abs(np.diff(baseline_data, axis=-1)), axis=-1)
    
    # Calculate post-stim line-length
    post_window = (epochs.times >= post_stim_window[0]) & (epochs.times <= post_stim_window[1])
    post_data = epochs.get_data()[:, :, post_window]
    post_ll = np.sum(np.abs(np.diff(post_data, axis=-1)), axis=-1)
    
    # Simple threshold
    mean_baseline = np.mean(baseline_ll, axis=0)
    std_baseline = np.std(baseline_ll, axis=0)
    
    # Check which channels exceed the threshold
    ad_channels = post_ll > (mean_baseline + threshold_factor * std_baseline)
    
    return ad_channels
