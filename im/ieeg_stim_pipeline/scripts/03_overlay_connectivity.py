#!/usr/bin/env python3
"""
Script to overlay connectivity and visualize diffusion data with electrodes.
Usage: python 03_overlay_connectivity.py <aparc_aseg_path> <tracts_path> <electrodes_json>
"""
import argparse
import json
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from ieeg_stim.imaging import assign_electrodes_to_rois
from ieeg_stim.connectivity import load_tractography, filter_tracts_by_roi, get_connectivity_matrix

def main():
    parser = argparse.ArgumentParser(description="Overlay connectivity onto electrodes")
    parser.add_argument('aparc_aseg', help="Path to FreeSurfer aparc+aseg.mgz")
    parser.add_argument('tracts', help="Path to diffusion tractography (.trk or .tck)")
    parser.add_argument('electrodes', help="Path to JSON file mapping electrode names to [x, y, z] RAS coordinates")
    parser.add_argument('--target_electrode', help="Specific electrode to visualize tracts for (optional)")
    args = parser.parse_args()

    print(f"Loading electrode coordinates from {args.electrodes}...")
    with open(args.electrodes, 'r') as f:
        elec_dict = json.load(f)
        
    print(f"Mapping electrodes to FreeSurfer ROIs using {args.aparc_aseg}...")
    roi_assignments = assign_electrodes_to_rois(elec_dict, args.aparc_aseg)
    for name, roi in roi_assignments.items():
        print(f"  Electrode {name} is in ROI index: {roi}")
        
    print(f"Loading tractography from {args.tracts}...")
    streamlines = load_tractography(args.tracts)
    print(f"Loaded {len(streamlines)} streamlines.")
    
    if args.target_electrode:
        if args.target_electrode not in elec_dict:
            print(f"Error: {args.target_electrode} not found in electrode JSON.")
            return
            
        target_coord = elec_dict[args.target_electrode]
        print(f"Filtering tracts passing within 5mm of {args.target_electrode} {target_coord}...")
        filtered_sl = filter_tracts_by_roi(streamlines, target_coord, radius=5.0)
        print(f"Found {len(filtered_sl)} connected streamlines.")
        
        # Simple 3D Visualization
        fig = plt.figure()
        ax = fig.add_subplot(111, projection='3d')
        
        # Plot streamlines
        for sl in filtered_sl:
            ax.plot(sl[:, 0], sl[:, 1], sl[:, 2], color='blue', alpha=0.1)
            
        # Plot electrode
        ax.scatter(target_coord[0], target_coord[1], target_coord[2], color='red', s=100, label=args.target_electrode)
        
        ax.set_xlabel('X (RAS)')
        ax.set_ylabel('Y (RAS)')
        ax.set_zlabel('Z (RAS)')
        plt.legend()
        plt.title(f"Tracts originating from {args.target_electrode}")
        plt.show()
        
    else:
        print("Calculating full electrode-to-electrode connectivity matrix...")
        conn_matrix, roi_names = get_connectivity_matrix(streamlines, elec_dict, radius=5.0)
        
        fig, ax = plt.subplots(figsize=(10, 8))
        cax = ax.matshow(conn_matrix, cmap='viridis')
        fig.colorbar(cax)
        
        ax.set_xticks(np.arange(len(roi_names)))
        ax.set_yticks(np.arange(len(roi_names)))
        ax.set_xticklabels(roi_names, rotation=90)
        ax.set_yticklabels(roi_names)
        
        plt.title("Streamline Count Between Electrodes")
        plt.tight_layout()
        plt.show()

if __name__ == '__main__':
    main()
