import subprocess
import sys

# opening requirements file and reading the packages
with open('requirements.txt', 'r') as f:
    packages = f.read().splitlines()

# filtering out comments and empty lines
packages = [pkg.strip() for pkg in packages if pkg.strip() and not pkg.startswith('#')]

# array for success and failure
success = []
failure = {}

for package in packages:
    print(f"installing {package}...")
    
    # run pip install command
    result = subprocess.run(
        [sys.executable, '-m', 'pip', 'install', package],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    if result.returncode == 0:
        print(f"{package} installed successfully.")
        success.append(package)
    else:
        print(f"{package} failed to install.\nError: {result.stderr}")
        failure[package] = result.stderr
        
print("\n" + "="*40)
print("\nInstallation Summary:")

if success:
    print("\nSuccessfully installed packages:")
    for pkg in success:
        print(f"- {pkg}")
if failure:
    print("\nFailed to install packages:")
    for pkg, error in failure.items():
        print(f"\n[PACKAGE]: {pkg}")
        # printing only the last few lines of the error message for better readability
        error_lines = error.strip().split('\n')
        print(f"[ERROR]: {error_lines[-2] if error_lines else 'Unknown error'}")