#!/usr/bin/env node
/**
 * 前端依赖检查脚本
 * 检查所有必需的 npm 包是否已安装
 */

const fs = require('fs');
const path = require('path');

// 定义所有需要的包（从 package.json 读取）
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const REQUIRED_DEPENDENCIES = packageJson.dependencies || {};
const REQUIRED_DEV_DEPENDENCIES = packageJson.devDependencies || {};

// 检查包是否已安装
function checkPackage(packageName, version) {
  try {
    const packagePath = path.join(__dirname, 'node_modules', packageName, 'package.json');
    if (!fs.existsSync(packagePath)) {
      return { installed: false, version: null };
    }
    const installedPackage = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return { installed: true, version: installedPackage.version };
  } catch (error) {
    return { installed: false, version: null };
  }
}

// 主函数
function main() {
  console.log('='.repeat(60));
  console.log('🔍 检查前端 npm 依赖包');
  console.log('='.repeat(60));
  console.log();

  let missingPackages = [];
  let installedPackages = [];

  // 检查生产依赖
  console.log('📦 检查生产依赖:');
  console.log('-'.repeat(60));

  for (const [packageName, version] of Object.entries(REQUIRED_DEPENDENCIES)) {
    const { installed, version: installedVersion } = checkPackage(packageName, version);
    
    if (installed) {
      console.log(`✅ ${packageName.padEnd(30)} v${installedVersion}`);
      installedPackages.push(packageName);
    } else {
      console.log(`❌ ${packageName.padEnd(30)} 未安装`);
      missingPackages.push(packageName);
    }
  }

  console.log();
  console.log('-'.repeat(60));

  // 检查开发依赖
  console.log();
  console.log('🛠️  检查开发依赖:');
  console.log('-'.repeat(60));

  for (const [packageName, version] of Object.entries(REQUIRED_DEV_DEPENDENCIES)) {
    const { installed, version: installedVersion } = checkPackage(packageName, version);
    
    if (installed) {
      console.log(`✅ ${packageName.padEnd(30)} v${installedVersion}`);
      installedPackages.push(packageName);
    } else {
      console.log(`❌ ${packageName.padEnd(30)} 未安装`);
      missingPackages.push(packageName);
    }
  }

  console.log();
  console.log('='.repeat(60));

  // 输出统计信息
  const totalRequired = Object.keys(REQUIRED_DEPENDENCIES).length + Object.keys(REQUIRED_DEV_DEPENDENCIES).length;
  const totalInstalled = installedPackages.length;
  const totalMissing = missingPackages.length;

  console.log('📊 统计信息:');
  console.log(`   总计: ${totalRequired} 个包`);
  console.log(`   已安装: ${totalInstalled} 个包`);
  console.log(`   缺失: ${totalMissing} 个包`);
  console.log();

  // 如果有缺失的包，提供安装命令
  if (missingPackages.length > 0) {
    console.log('❌ 发现缺失的包！');
    console.log();
    console.log('请运行以下命令安装缺失的包:');
    console.log();
    console.log('   npm install');
    console.log();
    console.log('或者:');
    console.log();
    console.log('   npm ci');
    console.log();
    console.log('='.repeat(60));
    process.exit(1);
  } else {
    console.log('✅ 所有必需的包都已安装！');
    console.log();
    console.log('='.repeat(60));
    process.exit(0);
  }
}

// 运行检查
main();
