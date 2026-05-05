from setuptools import setup, find_packages

setup(
    name='astech-server-ml',
    version='0.1.0',
    packages=find_packages(),
    install_requires=[
        'fastapi',
        'joblib',
        'numpy',
        'pandas',
        'scikit-learn',
        'pydantic',
        'sklearn',
    ],
    author="BaerTech",
    description="ML inference service for AsTech's asset valuation and depreciation models.",
)
