from setuptools import setup, find_packages

setup(
    name="apex_scoring",
    version="0.1.0",
    description="ACU Blueprint Holistic GPA scoring system",
    author="ACU Blueprint Team",
    packages=find_packages(),
    install_requires=[
        "numpy>=1.26.0",
        "scipy>=1.12.0",
        "pandas>=2.2.0",
        "supabase>=2.0.0",
        "python-dotenv>=1.0.0",
        "pydantic>=2.4.0",
        "structlog>=23.2.0",
    ],
    python_requires=">=3.11",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
)
