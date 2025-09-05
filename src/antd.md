---
layout: base.njk
title: Ant Design Icons
description: Подбор иконок из библиотеки Ant Design Icons
---

<div class="container">
    <h1>Подобрать иконку Ant Design Icons</h1>
    
    <div class="search-section">
        <div class="search-input-container">
            <input 
                type="text" 
                id="iconSearch" 
                class="search-input" 
                placeholder="Поиск иконок по названию..."
                autocomplete="off"
            >
        </div>
        <div class="search-results-info">
            <span id="resultsCount">Найдено иконок: <strong>{{ antdIcons.length }}</strong></span>
        </div>
    </div>
    
    <div class="icons-grid" id="iconsGrid">
        {% for icon in antdIcons %}
        <div class="icon-card" data-name="{{ icon.name }}" data-keywords="{{ icon.keywords.join(',') }}">
            <div class="icon-preview">
                <div class="icon-placeholder" data-icon="{{ icon.name }}">
                    <!-- Иконка будет загружена через JavaScript -->
                </div>
            </div>
            <div class="icon-info">
                <div class="icon-name">{{ icon.name }}</div>
            </div>
            <div class="icon-actions">
                <button class="copy-btn" data-icon="{{ icon.name }}" title="Копировать название">
                    <span class="copy-text">Копировать</span>
                </button>
            </div>
        </div>
        {% endfor %}
    </div>
    
    <div class="no-results" id="noResults" style="display: none;">
        <p>Иконки не найдены. Попробуйте изменить поисковый запрос.</p>
    </div>
</div>
