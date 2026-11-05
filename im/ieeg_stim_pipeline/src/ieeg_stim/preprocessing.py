"""
Preprocessing module for intracranial EEG data.
"""
import mne
import numpy as np

def load_ieeg_data(file_path):
    """
    Load raw iEEG data using MNE.
    Attempts to read EDF by default.
    """
    raw = mne.io.read_raw_edf(file_path, preload=True)
    return raw

def apply_filters(raw, l_freq=1.0, h_freq=150.0, notch_freqs=np.arange(60, 241, 60)):
    """
    Apply bandpass and notch filters to raw data.
    """
    raw_filt = raw.copy()
    
    # Notch filter for line noise and harmonics
    if notch_freqs is not None:
        raw_filt.notch_filter(freqs=notch_freqs, method='spectrum_fit', filter_length='auto', phase='zero')
        
    # Bandpass filter
    if l_freq is not None or h_freq is not None:
        raw_filt.filter(l_freq=l_freq, h_freq=h_freq, method='fir', phase='zero')
        
    return raw_filt

def apply_rereferencing(raw, ref_channels='average'):
    """
    Apply re-referencing to the data.
    """
    raw_ref = raw.copy()
    if ref_channels == 'average':
        raw_ref.set_eeg_reference('average', projection=False)
    elif isinstance(ref_channels, list):
        raw_ref.set_eeg_reference(ref_channels, projection=False)
    # Could also implement bipolar referencing here
    return raw_ref
