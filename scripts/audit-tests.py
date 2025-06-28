#! /usr/bin/env python3
"""
Audit automated tests by traversing our key subprojects and produces the following statistics:

    number of source files
    number of test suite files
    number of test support files (i.e. non-test files like mocks, fakes, abstract base test suites, etc)
    lines of text in each of the above categories (easier than source lines of code, and good enough for comparison)
    the ratio of test lines to source lines

Usage:

From the repo root, call with

    python scripts/audit-tests.py

"""
import sys
from abc import ABC, abstractmethod
from dataclasses import dataclass
from functools import cache
from pathlib import Path
from typing import TextIO


@dataclass(frozen=True)
class Report:
    """A `Report` presents audit results."""
    name: str
    sources: list[Path]
    source_lines: int
    tests: list[Path]
    test_lines: int
    test_support: list[Path]
    test_support_lines: int
    all_test_lines_to_source_lines_percent: int

    def print(self, output: TextIO):
        output.write(self.name + ':\n')

        output.write(f'    {self.source_lines:7,} lines in {len(self.sources):5,} source files\n')
        output.write(f'    {self.test_lines:7,} lines in {len(self.tests):5,} test files\n')
        output.write(f'    {self.test_support_lines:7,} lines in {len(self.test_support):5,} test support files\n')
        output.write(f'    test to source code ratio: {self.all_test_lines_to_source_lines_percent:2}%\n')

        output.write('\n')


@dataclass(frozen=True)
class Audit:
    """An `Audit` gathers statistics from a `Project`."""
    parent_dir: Path
    project: 'Project'

    def run(self) -> Report:
        sources = self.project.find_sources(self.parent_dir)
        source_lines = sum(
            [count_lines(file) for file in sources]
        )
        tests = self.project.find_tests(self.parent_dir)
        test_lines = sum(
            [count_lines(file) for file in tests]
        )
        test_support = self.project.find_test_support_files(self.parent_dir)
        test_support_lines = sum(
            [count_lines(file) for file in test_support]
        )

        all_test_lines = test_lines + test_support_lines
        if source_lines:
            all_test_lines_to_source_lines_percent = int(
                all_test_lines / source_lines * 100
            )
        else:
            all_test_lines_to_source_lines_percent = 0

        return Report(
            self.project.child_dir.name,
            sources,
            source_lines,
            tests,
            test_lines,
            test_support,
            test_support_lines,
            all_test_lines_to_source_lines_percent,
        )


@dataclass(frozen=True)
class Project(ABC):
    """A `Project` finds project source and test files."""
    child_dir: Path

    @abstractmethod
    def find_sources(self, parent_dir: Path) -> list[Path]:
        """Find source files."""
        pass

    @abstractmethod
    def find_tests(self, parent_dir: Path) -> list[Path]:
        """Find actual test files and test suites."""
        pass

    @abstractmethod
    def find_test_support_files(self, parent_dir: Path) -> list[Path]:
        """Find test support code (e.g. fakes, mocks, abstract tests, etc)."""
        pass


@dataclass(frozen=True)
class MavenProject(Project):
    @cache
    def find_all_test_files(self, parent_dir: Path) -> list[Path]:
        """Find all tests and test support files."""
        project_root = parent_dir / self.child_dir
        return find_files([project_root / 'src/test/java'], '**/*.java')

    def find_sources(self, parent_dir: Path) -> list[Path]:
        project_root = parent_dir / self.child_dir
        return find_files([project_root / 'src/main/java'], '**/*.java')

    def find_tests(self, parent_dir: Path) -> list[Path]:
        all_test_files = self.find_all_test_files(parent_dir)
        return [file for file in all_test_files if is_java_test(file)]

    def find_test_support_files(self, parent_dir: Path) -> list[Path]:
        all_test_files = self.find_all_test_files(parent_dir)
        return [file for file in all_test_files if not is_java_test(file)]


@dataclass(frozen=True)
class NPMProject(Project):
    @cache
    def find_all_files(self, parent_dir: Path) -> list[Path]:
        """Find all source and test files."""
        project_root = parent_dir / self.child_dir
        return find_files([project_root / 'src'], '**/*.ts*')

    def find_sources(self, parent_dir: Path) -> list[Path]:
        all_files = self.find_all_files(parent_dir)
        return [file for file in all_files if not is_typescript_test(file)]

    def find_tests(self, parent_dir: Path) -> list[Path]:
        all_files = self.find_all_files(parent_dir)
        return [file for file in all_files if is_typescript_test(file)]

    def find_test_support_files(self, parent_dir: Path) -> list[Path]:
        all_files = self.find_all_files(parent_dir)
        return [file for file in all_files if is_typescript_test_support(file)]


@dataclass(frozen=True)
class SBTProject(Project):
    @cache
    def find_all_test_files(self, parent_dir: Path) -> list[Path]:
        """Find all tests and test support files."""
        project_root = parent_dir / self.child_dir
        return find_files([project_root / 'shared/src/test/scala'], '**/*.scala')

    def find_sources(self, parent_dir: Path) -> list[Path]:
        project_root = parent_dir / self.child_dir
        return find_files([project_root / 'shared/src/main/scala'], '**/*.scala')

    def find_tests(self, parent_dir: Path) -> list[Path]:
        all_test_files = self.find_all_test_files(parent_dir)
        return [file for file in all_test_files if is_scala_test(file)]

    def find_test_support_files(self, parent_dir: Path) -> list[Path]:
        all_test_files = self.find_all_test_files(parent_dir)
        return [file for file in all_test_files if not is_scala_test(file)]


PROJECTS = [
    MavenProject(Path('backend')),
    NPMProject(Path('df-client/df-client-app')),
    # TODO: projects in df-client/
    MavenProject(Path('email-service')),
    SBTProject(Path('fact-graph-scala')),
    # TODO: libs/
    # TODO: state-api/
    MavenProject(Path('status')),
    MavenProject(Path('submit')),
    # TODO: projects in utils/
]


def count_lines(file: Path) -> int:
    count = 0
    with file.open() as f:
        for _ in f:
            count += 1
    return count


def find_files(roots: list[Path], glob: str) -> list[Path]:
    files = []
    for directory in roots:
        files += [
            file for file in directory.glob(glob) if file.is_file()
        ]
    files.sort()
    return files


def find_parent_dir() -> Path:
    script = Path(__file__)
    if (not script.parts[-2] == 'scripts'
            or not script.parts[-3] == 'direct-file'):
        sys.exit(
            f"Expected '{script.name}' to live in 'direct-file/scripts/' but it's located in '{script}'\n"
        )
    return script.parent.parent.resolve()


def is_java_test(path: Path) -> bool:
    return (
            path.name.endswith('Test.java')
            and not path.name.startswith('Base')
    )


def is_scala_test(path: Path) -> bool:
    return path.name.endswith('Spec.scala')


def is_typescript_test(path: Path) -> bool:
    return (
            path.name.endswith('.test.ts')
            or path.name.endswith('.test.tsx')
    )


TYPESCRIPT_TEST_SUPPORT = {
    'factgraphTestHelpers.tsx',
    'test-utils.tsx',
}


def is_typescript_test_support(path: Path) -> bool:
    if path.name in TYPESCRIPT_TEST_SUPPORT:
        return True
    else:
        return 'test' in path.parts and not is_typescript_test(path)


def main():
    output = sys.stdout
    parent_dir = find_parent_dir()
    for project in PROJECTS:
        audit = Audit(parent_dir, project)
        report = audit.run()
        report.print(output)


if __name__ == '__main__':
    main()
