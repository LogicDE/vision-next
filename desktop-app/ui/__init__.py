"""
Módulo de interfaces de usuario.
"""

from ui.base_screen import BaseScreen
from ui.login_screen import LoginScreen
from ui.dashboard_screen import DashboardScreen
from ui.charts_screen import (
    ChartsScreen,
    EmployeeMetricsScreen,
    GroupMetricsScreen,
    BurnoutPredictionsScreen,
    AlertsScreen
)

__all__ = [
    'BaseScreen',
    'LoginScreen',
    'DashboardScreen',
    'ChartsScreen',
    'EmployeeMetricsScreen',
    'GroupMetricsScreen',
    'BurnoutPredictionsScreen',
    'AlertsScreen'
]

