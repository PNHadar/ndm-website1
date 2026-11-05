"""
iEEG Stimulation and Connectivity Pipeline.
Module for processing stimulation data and mapping to structural connectivity.
"""
from . import preprocessing
from . import stimulation
from . import imaging
from . import connectivity

__all__ = ['preprocessing', 'stimulation', 'imaging', 'connectivity']
