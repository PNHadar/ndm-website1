#!/usr/bin/env python3
"""
Script to extract and analyze stimulation trains.
Usage: python 02_analyze_stimulation.py <input_fif> --stim_channel <channel_name>
"""
import argparse
import mne
import matplotlib.pyplot as plt
from ieeg_stim.stimulation import extract_stim_events, epoch_1hz_train, epoch_50hz_train, detect_afterdischarges

def main():
    parser = argparse.ArgumentParser(description="Analyze iEEG stimulation trains")
    parser.add_argument('input_file', help="Path to preprocessed data (.fif)")
    parser.add_argument('--stim_channel', default='STIM', help="Name of the trigger channel")
    parser.add_argument('--stim_type', choices=['1hz', '50hz'], required=True, 
                        help="Type of stimulation (1hz or 50hz)")
    args = parser.parse_args()

    print(f"Loading data from {args.input_file}...")
    raw = mne.io.read_raw_fif(args.input_file, preload=True)
    
    print(f"Extracting events from channel {args.stim_channel}...")
    events = extract_stim_events(raw, stim_channel_name=args.stim_channel)
    
    if len(events) == 0:
        print(f"No events found on channel {args.stim_channel}.")
        return
        
    print(f"Found {len(events)} events.")
    
    if args.stim_type == '1hz':
        print("Epoching for 1 Hz train (30s window)...")
        # In a real scenario, we might want only the first event of the train
        # Here we just take the first event for demonstration
        train_event = [events[0]] 
        epochs = epoch_1hz_train(raw, train_event, tmin=-5.0, tmax=35.0)
    else:
        print("Epoching for 50 Hz train (blanking artifact)...")
        # Same here, assume the first event marks the start of the 50Hz train
        train_event = [events[0]]
        epochs = epoch_50hz_train(raw, train_event, tmin=-10.0, tmax=30.0, stim_duration=5.0)
        
        print("Running automated afterdischarge detection...")
        ad_channels = detect_afterdischarges(epochs)
        
        # ad_channels is a boolean array of shape (n_epochs, n_channels)
        channel_names = raw.ch_names
        for i, epoch_ads in enumerate(ad_channels):
            active_chs = [channel_names[j] for j, is_ad in enumerate(epoch_ads) if is_ad]
            print(f"Epoch {i}: ADs detected on channels: {active_chs}")
            
    print("Plotting epochs...")
    epochs.plot(n_channels=20, scalings='auto')
    # plt.show() # Automatically handled by MNE in interactive mode

if __name__ == '__main__':
    main()
