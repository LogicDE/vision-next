"""
Script para entrenar el modelo de burnout

Nota: Requiere los archivos CSV en la carpeta data/:
- burnout.csv
- stress.csv
- summary.csv
"""

from app.burnout_model import BurnoutPredictor

def main():
    print("="*70)
    print("  ENTRENANDO MODELO DE BURNOUT")
    print("="*70)
    
    predictor = BurnoutPredictor(data_path="data/")
    
    try:
        print("\n📊 Cargando y preprocesando datos...")
        metrics = predictor.train_model()
        
        print("\n✅ Modelo entrenado exitosamente!")
        print(f"\n📈 Métricas del modelo:")
        print(f"  - Accuracy (CV): {metrics['cv_accuracy_mean']:.4f} ± {metrics['cv_accuracy_std']:.4f}")
        print(f"  - Test Accuracy: {metrics['test_accuracy']:.4f}")
        print(f"  - Test Precision: {metrics['test_precision']:.4f}")
        print(f"  - Test Recall: {metrics['test_recall']:.4f}")
        print(f"  - Test F1: {metrics['test_f1']:.4f}")
        
        print("\n💾 Guardando modelo...")
        predictor.save_model()
        
        print("\n✅ Modelo guardado en models/burnout_model.pkl")
        print("\n🎉 ¡Entrenamiento completado con éxito!")
        
    except FileNotFoundError as e:
        print(f"\n❌ Error: No se encontraron los archivos de datos")
        print(f"   {str(e)}")
        print("\n📝 Asegúrate de tener los siguientes archivos en data/:")
        print("   - burnout.csv")
        print("   - stress.csv")
        print("   - summary.csv")
        return False
    except Exception as e:
        print(f"\n❌ Error durante el entrenamiento: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

