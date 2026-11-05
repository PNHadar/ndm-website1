#!/usr/bin/env python3
"""
Script to preprocess iEEG data.
Usage: python 01_preprocess_ieeg.py <input_edf> <output_fif>
"""
import sys
import argparse
import mne
from ieeg_stim.preprocessing import load_ieeg_data, apply_filters, apply_rereferencing

def main():
    parser = argparse.ArgumentParser(description="Preprocess iEEG data")
    parser.add_argument('input_file', help="Path to input raw data (e.g., .edf)")
    parser.add_argument('output_file', help="Path to save processed data (.fif)")
    parser.add_argument('--l_freq', type=float, default=1.0, help="High-pass filter frequency")
    parser.add_argument('--h_freq', type=float, default=150.0, help="Low-pass filter frequency")
    args = parser.parse_args()

    print(f"Loading data from {args.input_file}...")
    raw = load_ieeg_data(args.input_file)
    
    print(f"Applying filters (Bandpass: {args.l_freq}-{args.h_freq} Hz, Notch: 60Hz and harmonics)...")
    raw_filt = apply_filters(raw, l_freq=args.l_freq, h_freq=args.h_freq)
    
    print("Applying common average reference...")
    # NOTE: In clinical practice, you might want to skip CAR for heavily artifactual stim data
    # or use bipolar referencing. We default to average here as a demonstration.
    raw_ref = apply_rereferencing(raw_filt, ref_channels='average')
    
    print(f"Saving preprocessed data to {args.output_file}...")
    raw_ref.save(args.output_file, overwrite=True)
    print("Done!")

if __name__ == '__main__':
    main()
