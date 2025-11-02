"""
Utilidades para generación de gráficas con matplotlib.
Diseñadas para visualización en interfaces móviles Tkinter.
"""

import matplotlib
matplotlib.use('TkAgg')  # Backend para Tkinter

import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime
from config import CHART_CONFIG, COLORS


class ChartGenerator:
    """
    Generador de gráficas optimizadas para dispositivos móviles.
    Usa matplotlib con estilo adaptado para pantallas pequeñas.
    """
    
    @staticmethod
    def create_line_chart(data: List[Dict[str, Any]], 
                         x_key: str, 
                         y_keys: List[str],
                         title: str,
                         labels: Optional[List[str]] = None,
                         figsize: Tuple[int, int] = (7, 4)) -> Figure:
        """
        Crea una gráfica de líneas.
        
        Args:
            data: Lista de diccionarios con los datos
            x_key: Clave para el eje X
            y_keys: Lista de claves para las líneas en el eje Y
            title: Título de la gráfica
            labels: Etiquetas para las líneas (opcional)
            figsize: Tamaño de la figura
            
        Returns:
            Figure de matplotlib
            
        Example:
            >>> data = [
            ...     {'date': '2024-01-01', 'value1': 10, 'value2': 20},
            ...     {'date': '2024-01-02', 'value1': 15, 'value2': 18},
            ... ]
            >>> fig = ChartGenerator.create_line_chart(
            ...     data, 'date', ['value1', 'value2'], 'Mi Gráfica'
            ... )
        """
        fig = Figure(figsize=figsize, dpi=CHART_CONFIG['dpi'])
        ax = fig.add_subplot(111)
        
        # Extraer datos
        x_values = [item[x_key] for item in data]
        
        # Dibujar líneas
        for idx, y_key in enumerate(y_keys):
            y_values = [item.get(y_key, 0) for item in data]
            label = labels[idx] if labels and idx < len(labels) else y_key
            color = CHART_CONFIG['colors'][idx % len(CHART_CONFIG['colors'])]
            
            ax.plot(x_values, y_values, 
                   marker='o', 
                   linewidth=2, 
                   markersize=6,
                   label=label,
                   color=color)
        
        # Configuración
        ax.set_title(title, fontsize=14, fontweight='bold', pad=15)
        ax.set_xlabel(x_key.capitalize(), fontsize=11)
        ax.legend(loc='best', fontsize=9)
        ax.grid(True, alpha=0.3)
        
        # Rotar etiquetas del eje X si son fechas
        if len(x_values) > 0 and isinstance(x_values[0], str):
            plt.setp(ax.xaxis.get_majorticklabels(), rotation=45, ha='right')
        
        fig.tight_layout()
        return fig
    
    @staticmethod
    def create_bar_chart(data: List[Dict[str, Any]],
                        x_key: str,
                        y_key: str,
                        title: str,
                        figsize: Tuple[int, int] = (7, 4)) -> Figure:
        """
        Crea una gráfica de barras.
        
        Args:
            data: Lista de diccionarios con los datos
            x_key: Clave para las categorías (eje X)
            y_key: Clave para los valores (eje Y)
            title: Título de la gráfica
            figsize: Tamaño de la figura
            
        Returns:
            Figure de matplotlib
        """
        fig = Figure(figsize=figsize, dpi=CHART_CONFIG['dpi'])
        ax = fig.add_subplot(111)
        
        # Extraer datos
        x_values = [item[x_key] for item in data]
        y_values = [item[y_key] for item in data]
        
        # Crear barras con colores alternados
        colors = [CHART_CONFIG['colors'][i % len(CHART_CONFIG['colors'])] 
                 for i in range(len(x_values))]
        
        bars = ax.bar(x_values, y_values, color=colors, alpha=0.8, edgecolor='white')
        
        # Agregar valores sobre las barras
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{height:.1f}',
                   ha='center', va='bottom', fontsize=9)
        
        # Configuración
        ax.set_title(title, fontsize=14, fontweight='bold', pad=15)
        ax.set_xlabel(x_key.capitalize(), fontsize=11)
        ax.set_ylabel(y_key.capitalize(), fontsize=11)
        ax.grid(True, alpha=0.3, axis='y')
        
        # Rotar etiquetas si son largas
        if len(x_values) > 0 and isinstance(x_values[0], str) and len(x_values[0]) > 5:
            plt.setp(ax.xaxis.get_majorticklabels(), rotation=45, ha='right')
        
        fig.tight_layout()
        return fig
    
    @staticmethod
    def create_pie_chart(data: Dict[str, float],
                        title: str,
                        figsize: Tuple[int, int] = (6, 6)) -> Figure:
        """
        Crea una gráfica de pastel.
        
        Args:
            data: Diccionario con categorías y valores
            title: Título de la gráfica
            figsize: Tamaño de la figura
            
        Returns:
            Figure de matplotlib
        """
        fig = Figure(figsize=figsize, dpi=CHART_CONFIG['dpi'])
        ax = fig.add_subplot(111)
        
        labels = list(data.keys())
        values = list(data.values())
        colors = CHART_CONFIG['colors'][:len(labels)]
        
        # Crear gráfica de pastel
        wedges, texts, autotexts = ax.pie(
            values,
            labels=labels,
            colors=colors,
            autopct='%1.1f%%',
            startangle=90,
            textprops={'fontsize': 10}
        )
        
        # Mejorar estilo
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')
        
        ax.set_title(title, fontsize=14, fontweight='bold', pad=15)
        ax.axis('equal')
        
        fig.tight_layout()
        return fig
    
    @staticmethod
    def create_multi_bar_chart(data: List[Dict[str, Any]],
                               x_key: str,
                               y_keys: List[str],
                               title: str,
                               labels: Optional[List[str]] = None,
                               figsize: Tuple[int, int] = (7, 4)) -> Figure:
        """
        Crea una gráfica de barras agrupadas.
        
        Args:
            data: Lista de diccionarios con los datos
            x_key: Clave para las categorías (eje X)
            y_keys: Lista de claves para las diferentes series
            title: Título de la gráfica
            labels: Etiquetas para las series (opcional)
            figsize: Tamaño de la figura
            
        Returns:
            Figure de matplotlib
        """
        fig = Figure(figsize=figsize, dpi=CHART_CONFIG['dpi'])
        ax = fig.add_subplot(111)
        
        # Extraer datos
        x_values = [item[x_key] for item in data]
        n_groups = len(x_values)
        n_bars = len(y_keys)
        
        # Configurar posiciones de las barras
        bar_width = 0.8 / n_bars
        x_pos = np.arange(n_groups)
        
        # Dibujar grupos de barras
        for idx, y_key in enumerate(y_keys):
            y_values = [item.get(y_key, 0) for item in data]
            label = labels[idx] if labels and idx < len(labels) else y_key
            color = CHART_CONFIG['colors'][idx % len(CHART_CONFIG['colors'])]
            
            offset = (idx - n_bars/2) * bar_width + bar_width/2
            ax.bar(x_pos + offset, y_values, bar_width, 
                  label=label, color=color, alpha=0.8)
        
        # Configuración
        ax.set_title(title, fontsize=14, fontweight='bold', pad=15)
        ax.set_xlabel(x_key.capitalize(), fontsize=11)
        ax.set_xticks(x_pos)
        ax.set_xticklabels(x_values)
        ax.legend(loc='best', fontsize=9)
        ax.grid(True, alpha=0.3, axis='y')
        
        fig.tight_layout()
        return fig
    
    @staticmethod
    def create_wellness_dashboard(metrics: List[Dict[str, Any]]) -> Figure:
        """
        Crea un dashboard de métricas de bienestar.
        
        Args:
            metrics: Lista de métricas con fecha, wellness_score, stress_level, etc.
            
        Returns:
            Figure con múltiples subplots
        """
        fig = Figure(figsize=(7, 8), dpi=CHART_CONFIG['dpi'])
        
        # Extraer datos
        dates = [m['date'] for m in metrics]
        wellness_scores = [m.get('wellness_score', 0) for m in metrics]
        stress_levels = [m.get('stress_level', 0) for m in metrics]
        productivity = [m.get('productivity', 0) for m in metrics]
        
        # Subplot 1: Wellness Score
        ax1 = fig.add_subplot(311)
        ax1.plot(dates, wellness_scores, marker='o', color=COLORS['primary'], 
                linewidth=2, markersize=6, label='Wellness Score')
        ax1.set_title('Puntuación de Bienestar', fontsize=12, fontweight='bold')
        ax1.set_ylabel('Score', fontsize=10)
        ax1.grid(True, alpha=0.3)
        ax1.legend(loc='best', fontsize=8)
        plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45, ha='right', fontsize=8)
        
        # Subplot 2: Stress Level
        ax2 = fig.add_subplot(312)
        ax2.plot(dates, stress_levels, marker='s', color=COLORS['error'], 
                linewidth=2, markersize=6, label='Nivel de Estrés')
        ax2.set_title('Nivel de Estrés', fontsize=12, fontweight='bold')
        ax2.set_ylabel('Nivel', fontsize=10)
        ax2.grid(True, alpha=0.3)
        ax2.legend(loc='best', fontsize=8)
        plt.setp(ax2.xaxis.get_majorticklabels(), rotation=45, ha='right', fontsize=8)
        
        # Subplot 3: Productivity
        ax3 = fig.add_subplot(313)
        colors_prod = [COLORS['success'] if p >= 80 else COLORS['warning'] for p in productivity]
        ax3.bar(dates, productivity, color=colors_prod, alpha=0.8)
        ax3.set_title('Productividad', fontsize=12, fontweight='bold')
        ax3.set_ylabel('Porcentaje', fontsize=10)
        ax3.set_xlabel('Fecha', fontsize=10)
        ax3.grid(True, alpha=0.3, axis='y')
        plt.setp(ax3.xaxis.get_majorticklabels(), rotation=45, ha='right', fontsize=8)
        
        fig.tight_layout()
        return fig
    
    @staticmethod
    def create_burnout_risk_chart(predictions: Dict[str, Any]) -> Figure:
        """
        Crea una visualización de riesgo de burnout.
        
        Args:
            predictions: Diccionario con predicciones de burnout
            
        Returns:
            Figure de matplotlib
        """
        fig = Figure(figsize=(7, 5), dpi=CHART_CONFIG['dpi'])
        
        # Datos
        high_risk = predictions.get('high_risk_employees', [])
        medium_risk = predictions.get('medium_risk_employees', [])
        overall_risk = predictions.get('overall_risk', 0)
        
        # Subplot 1: Distribución de riesgo
        ax1 = fig.add_subplot(211)
        categories = ['Alto Riesgo', 'Riesgo Medio', 'Bajo Riesgo']
        values = [len(high_risk), len(medium_risk), 10]  # 10 es simulado
        colors = [COLORS['error'], COLORS['warning'], COLORS['success']]
        
        bars = ax1.bar(categories, values, color=colors, alpha=0.8)
        for bar in bars:
            height = bar.get_height()
            ax1.text(bar.get_x() + bar.get_width()/2., height,
                    f'{int(height)}',
                    ha='center', va='bottom', fontsize=10, fontweight='bold')
        
        ax1.set_title('Distribución de Riesgo de Burnout', fontsize=12, fontweight='bold')
        ax1.set_ylabel('Número de Empleados', fontsize=10)
        ax1.grid(True, alpha=0.3, axis='y')
        
        # Subplot 2: Riesgo individual top 5
        ax2 = fig.add_subplot(212)
        
        all_risks = high_risk + medium_risk
        top_risks = sorted(all_risks, key=lambda x: x['risk_score'], reverse=True)[:5]
        
        if top_risks:
            names = [r['name'] for r in top_risks]
            scores = [r['risk_score'] * 100 for r in top_risks]
            colors_bars = [COLORS['error'] if s >= 70 else COLORS['warning'] for s in scores]
            
            bars = ax2.barh(names, scores, color=colors_bars, alpha=0.8)
            for bar in bars:
                width = bar.get_width()
                ax2.text(width, bar.get_y() + bar.get_height()/2.,
                        f'{width:.1f}%',
                        ha='left', va='center', fontsize=9, fontweight='bold')
            
            ax2.set_title('Top 5 Empleados en Riesgo', fontsize=12, fontweight='bold')
            ax2.set_xlabel('Score de Riesgo (%)', fontsize=10)
            ax2.grid(True, alpha=0.3, axis='x')
        
        fig.tight_layout()
        return fig


class ChartManager:
    """
    Gestor de gráficas para integración con Tkinter.
    Maneja la creación y actualización de gráficas en la interfaz.
    """
    
    def __init__(self, parent_frame):
        """
        Inicializa el gestor de gráficas.
        
        Args:
            parent_frame: Frame de Tkinter donde se mostrará la gráfica
        """
        self.parent_frame = parent_frame
        self.canvas = None
        self.current_figure = None
    
    def display_chart(self, figure: Figure) -> None:
        """
        Muestra una gráfica en el frame de Tkinter.
        
        Args:
            figure: Figure de matplotlib a mostrar
        """
        # Limpiar gráfica anterior
        self.clear_chart()
        
        # Crear canvas para la nueva gráfica
        self.current_figure = figure
        self.canvas = FigureCanvasTkAgg(figure, master=self.parent_frame)
        self.canvas.draw()
        
        # Mostrar en el frame
        self.canvas.get_tk_widget().pack(fill='both', expand=True)
    
    def clear_chart(self) -> None:
        """Limpia la gráfica actual del frame."""
        if self.canvas:
            self.canvas.get_tk_widget().destroy()
            self.canvas = None
        
        if self.current_figure:
            plt.close(self.current_figure)
            self.current_figure = None
    
    def update_chart(self, figure: Figure) -> None:
        """
        Actualiza la gráfica mostrada.
        
        Args:
            figure: Nueva figura a mostrar
        """
        self.display_chart(figure)

