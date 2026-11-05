"""
Connectivity module for overlaying diffusion tractography data.
"""
import nibabel as nib
from nibabel.streamlines import load as load_tracts
import numpy as np

def load_tractography(trk_file_path):
    """
    Load tractography streamlines from a .trk or .tck file.
    """
    tractogram = load_tracts(trk_file_path)
    streamlines = tractogram.streamlines
    return streamlines

def filter_tracts_by_roi(streamlines, roi_center, radius=5.0):
    """
    Filter streamlines to keep only those that pass within a certain radius 
    of a given Region of Interest (ROI) center (e.g., an electrode coordinate).
    """
    filtered_streamlines = []
    
    for sl in streamlines:
        # sl is an array of shape (N, 3) where N is number of points in the streamline
        # Calculate distances from all points in the streamline to the roi_center
        distances = np.linalg.norm(sl - roi_center, axis=1)
        
        if np.any(distances <= radius):
            filtered_streamlines.append(sl)
            
    return filtered_streamlines

def get_connectivity_matrix(streamlines, roi_centers_dict, radius=5.0):
    """
    Generate a simple binary or count connectivity matrix between a set of ROIs
    (e.g., electrode coordinates) based on whether streamlines pass through them.
    """
    roi_names = list(roi_centers_dict.keys())
    n_rois = len(roi_names)
    connectivity_matrix = np.zeros((n_rois, n_rois))
    
    for sl in streamlines:
        # Determine which ROIs this streamline passes through
        passing_rois = []
        for i, name in enumerate(roi_names):
            coord = roi_centers_dict[name]
            distances = np.linalg.norm(sl - coord, axis=1)
            if np.any(distances <= radius):
                passing_rois.append(i)
                
        # Update connectivity matrix for pairs of ROIs
        for i in range(len(passing_rois)):
            for j in range(i + 1, len(passing_rois)):
                idx1 = passing_rois[i]
                idx2 = passing_rois[j]
                connectivity_matrix[idx1, idx2] += 1
                connectivity_matrix[idx2, idx1] += 1
                
    return connectivity_matrix, roi_names
