"""
Imaging module for handling structural MRI and FreeSurfer parcellations.
"""
import nibabel as nib
import numpy as np

def load_freesurfer_parcellation(aparc_aseg_path):
    """
    Load FreeSurfer aparc+aseg.mgz or .nii.gz file.
    """
    img = nib.load(aparc_aseg_path)
    data = img.get_fdata()
    affine = img.affine
    return img, data, affine

def get_roi_at_coordinate(data, affine, coord_ras):
    """
    Given an RAS coordinate (x, y, z) in mm, find the FreeSurfer ROI index.
    """
    # Inverse of affine to go from RAS to voxel coordinates
    inv_affine = np.linalg.inv(affine)
    coord_homog = np.array([coord_ras[0], coord_ras[1], coord_ras[2], 1.0])
    voxel_coord = np.dot(inv_affine, coord_homog)[:3]
    voxel_idx = np.round(voxel_coord).astype(int)
    
    # Boundary check
    if (0 <= voxel_idx[0] < data.shape[0] and
        0 <= voxel_idx[1] < data.shape[1] and
        0 <= voxel_idx[2] < data.shape[2]):
        roi_val = data[voxel_idx[0], voxel_idx[1], voxel_idx[2]]
        return roi_val
    else:
        return None

def assign_electrodes_to_rois(electrode_coords_dict, aparc_aseg_path):
    """
    Assign a list of electrode coordinates to FreeSurfer ROIs.
    """
    _, data, affine = load_freesurfer_parcellation(aparc_aseg_path)
    
    assignments = {}
    for ele_name, coord in electrode_coords_dict.items():
        roi = get_roi_at_coordinate(data, affine, coord)
        assignments[ele_name] = roi
        
    return assignments
