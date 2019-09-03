---
uuid: 0227db69-0a2a-4503-930b-7c7f959c4cbb
title: LeetCode - two-sum
tags:
  - leetcode
  - algorithms
  - c++
categories:
  - LeetCode 刷題目
series: LeetCode
mathjax: true
date: 2019-02-20 00:00:00
updated: 2019-02-20 00:00:00
---

> Leetcode: [two-sum](https://leetcode.com/problems/two-sum/) {% label success@Easy %}

<!--more-->

# [正文]

## 題目
Given an array of integers, return {% label info@indices %} of the two numbers such that they add up to a specific target.

You may assume that each input would have {% label info@exactly %} one solution, and you may not use the same element twice.

{% codeblock example lang:plain line_number:false %}
Given nums = [2, 7, 11, 15], target = 9,

Because nums[0] + nums[1] = 2 + 7 = 9,
return [0, 1].
{% endcodeblock %}

## 分析

最一開始想到的解法是把每個組合都跑過看看是不是等於 target，但是這樣時間複雜度是 $O(n^2)$;
分析後發現可以用空間換取時間，$a_i + b_i = target \Rightarrow a_i = target - b_i$，只要存下 $target - b_i$ 的結果，再拿去和原本的 a 陣列去比對有沒有一樣的元素，直接輸出 index 就是我們要的結果！

{% codeblock example lang:plain line_number:false %}
target = 9
         a = [ 2,  7, 11, 15] = A
target - b = [ 7,  2, -2, -6] = B

> A[0] == B[1], output: [0, 1]
{% endcodeblock %}

但是找兩陣列有沒有相同元素的時間複雜度還是 $O(n^2)$，並沒有比較好，我們需要換一個資料結構。把 B 陣列的元素拿來當 hash 的 key, index 當 value, 這樣確認有沒有一樣的操作就可以降低到 $O(1)$，整體的 時間複雜度還是 $O(n)$
{% codeblock example lang:plain line_number:false %}
target = 9
A = [ 2,  7, 11, 15]
B = { 7:0,  2:1, -2:2, -6:3 }

> B[A[0]] == 1 有值, output: [0, 1]
{% endcodeblock %}

打算開始寫 code 的時候發現我先建構 hash B 出來，再去 check A，整體來說跑 $O(2n)$，其實可以一邊建構 hash B 一邊 check，省下一點常數時間，變成 $O(n)$，主要就是每讀進一個 A，就 check 一次，沒有就丟進 hash B 裡面，假設答案是 `A[i]`, `A[j]` 且 `i < j`，會先讀到 `A[i]`，check 不會過，因為 `A[j]` 不在 hash B 裡面，讀到 `A[j]`，check 會過，因為 `A[i]` 在 hash B 裡面，`B[A[j]] = i`;

## code
{% codeblock lang:cpp line_number:true highlight:true first_line:1 %}
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;

        for ( int i = 0; i < nums.size(); ++i ) {
            int it = target - nums[i];
            if ( map.find(it) != map.end() ) {
                return { map[it], i };
            }
            map[nums[i]] = i;
        }
        return {};
    }
};
{% endcodeblock %}

{% note info %}
1. unordered_map 是 c++ STL 的容器，主要用於 hash;
{% endnote %}
